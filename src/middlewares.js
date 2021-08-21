const fs = require('fs');

const { firebase, commons: { getDateToday } } = require('./utils');

function notFound(req, res, next) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  /* eslint-enable no-unused-vars */
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
}

async function monitorDailyUsage(req, res, next) {
  /** Init Firebase Firestore Database */
  const dailyUsageDB = firebase.firestore().collection('daily_usage');
  const uploadsDB = firebase.firestore().collection('uploads');
  const nodeId = `${getDateToday()}-${req.clientIp}`;
  const dailyUsageRef = await dailyUsageDB.doc(nodeId);
  const dailyUsage = await dailyUsageRef.get();

  // if user already has a record
  if (dailyUsage.exists) {
    // if attempting to download a file
    if (req.method === 'GET') {
      if (req.params.publicKey) {
        const { publicKey } = req.params;
        const list = await uploadsDB.where('publicKey', '==', publicKey).get();
        // if file exists, verify
        if (!list.empty) {
          const { downloads } = dailyUsage.data();
          let file = null;
          list.forEach((item) => file = item.data());

          // verify remaining size vs size of file to be downloaded
          const remainingSize = downloads - file.size;
          if (remainingSize <= 0) {
            return res.status(400).json({
              error: 'Exceed limit',
              message: 'Downloading this file will exceed your daily download limit. Either download a smaller file or try again tomorrow.'
            });
          }
          // if file is still within allowed limit
          return next();
        }
        // if file does not exist
        return res.status(400).json({
          error: 'Not found',
          message: 'File does not exist.'
        });
      }
      return next();
    }

    // if attempting to upload a file
    if (req.method === 'POST') {
      if (req.file) {
        const { uploads } = dailyUsage.data();
        const remainingSize = uploads - req.file.size;

        // verify remaining size vs size of file to be uploaded
        if (remainingSize <= 0) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({
            error: 'Exceed limit',
            message: 'Uploading this file will exceed your daily upload limit. Either upload a smaller file or try again tomorrow.'
          });
        }
        // if file is still within allowed limit
        return next();
      }
      // if file does not exist
      return res.status(400).json({
        error: 'Not found',
        message: 'File does not exist.'
      });
    }
  } else {
    // if user is a first timer
    next();
  }
}

module.exports = {
  notFound,
  errorHandler,
  monitorDailyUsage
};
