const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.FOLDER);
  },
  filename: (req, file, cb) => {
    const formattedName = `${Date.now()}-${file.originalname.replace(/ /g, '-')}`;
    cb(null, formattedName);
  },

});

module.exports = storage;
