const express = require('express');
const router = express.Router();

const frontendRouter = require('./frontend/frontendRoutes.js');
const CustomAPIRouter = require('./api/APIRoutes/CustomRoutes.js');
const MapAPIRouter = require('./api/APIRoutes/MapRoutes.js');
const RegionAPIRouter = require('./api/APIRoutes/RegionRoutes.js');
const UploadAPIRouter = require('./api/APIRoutes/UploadRoutes.js');

router.use( frontendRouter );
router.use('/api', CustomAPIRouter);
router.use('/api', MapAPIRouter);
router.use('/api', RegionAPIRouter);
router.use('/api/upload', UploadAPIRouter);

module.exports = router;