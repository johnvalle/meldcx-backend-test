const express = require('express');

const Routes = require('../routes');

const router = express.Router();

router.use('/file', Routes.FileRoutes);

module.exports = router;
