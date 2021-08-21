const express = require('express');
const multer = require('multer');

const FileController = require('../controllers/FileController');
const { storage } = require('../utils');
const middlewares = require('../middlewares');

const upload = multer({ storage });

const router = express.Router();

router.post('/', [upload.single('file'), middlewares.monitorDailyUsage], FileController.upload);
router.get('/:publicKey', middlewares.monitorDailyUsage, FileController.download);
router.delete('/:privateKey', FileController.remove);

module.exports = router;
