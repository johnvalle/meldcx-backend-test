const uuid = require('uuid');
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');

const { firebase, commons: { updateDailyUsage } } = require('../utils');
const { STORAGE_TIME } = require('../constants');

/** Init Firebase Firestore Database */
const db = firebase.firestore().collection('uploads');
/** Init Google Cloud Storage */
const storage = new Storage({ keyFilename: process.env.CONFIG });
const bucket = storage.bucket(process.env.BUCKET_NAME);

/**
 * Uploads file to local or cloud depending on the PROVIDER.
 *
 * Method: POST
 * Content-Type: multipart/form-data
 * Param: None
 * Body: file
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 *
 * @example Sample response:
 * {
 *    privateKey: string;
 *    publicKey: string;
 * }
 */
async function upload(req, res, next) {
  try {
    if (req.file) {
      const { file } = req;
      let downloadPath = `http://localhost:${process.env.PORT}/uploads/${file.filename}`;

      // if PROVIDER is google, upload to bucket
      if (process.env.PROVIDER === 'google') {
        await bucket.upload(file.path, { destination: file.filename });
        const [url] = await bucket.file(file.filename).getSignedUrl({
          version: 'v2',
          action: 'read',
          expires: STORAGE_TIME
        });
        downloadPath = url;
        fs.unlinkSync(file.path);
      }

      // Keys for access
      const keys = { privateKey: uuid.v4(), publicKey: uuid.v4() };
      // Add reference to firestore database
      db.add({
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: downloadPath,
        date_added: Date.now(),
        ...keys
      });
      updateDailyUsage({
        action: 'upload',
        fileSize: file.size,
        ipAddress: req.clientIp
      });
      res.status(201).json(keys);
    } else {
      res.status(400).json({
        error: 'Missing parameter',
        message: 'File is a required field.'
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Returns the file depending on the `publicKey`.
 *
 * Method: GET
 * Content-Type: application/json
 * Param: `:publicKey`
 * Body: None
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 *
 * @example Sample response:
 * {
 *    privateKey: string;
 *    publicKey: string;
 * }
 */
async function download(req, res, next) {
  try {
    const { publicKey } = req.params;
    const list = await db.where('publicKey', '==', publicKey).get();
    let file = null;
    if (!list.empty) {
      list.forEach((doc) => file = doc.data());
      res.send({
        path: file.path,
        mimetype: file.mimetype,
        filename: file.filename
      });
      updateDailyUsage({
        action: 'download',
        fileSize: file.size,
        ipAddress: req.clientIp
      });
    } else {
      res.status(400).json({
        error: 'Not found',
        message: 'File does not exist.'
      });
    }
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const { privateKey } = req.params;
    const list = await db.where('privateKey', '==', privateKey).get();

    if (!list.empty) {
      let file = null;
      list.forEach((doc) => {
        file = doc.data();
        // delete database reference
        db.doc(doc.id).delete();
      });
      // delete actual file in cloud storage
      if (process.env.PROVIDER === 'google') {
        await bucket.file(file.filename).delete();
      }
      // delete actual file in local directory
      if (process.env.PROVIDER === 'local') {
        fs.unlinkSync(`${process.env.FOLDER}/${file.filename}`);
      }
      res.json({
        message: 'File has been removed sucessfully.'
      });
    }

    res.status(400).json({
      error: 'Not found',
      message: 'File does not exist.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  upload, download, remove
};
