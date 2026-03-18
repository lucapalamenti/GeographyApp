const express = require('express');
const router = express.Router();

const frontendRouter = require('./frontend/frontendRoutes.js');
const CustomAPIRouter = require('./api/APIRoutes/CustomRoutes.js');
const MapAPIRouter = require('./api/APIRoutes/MapRoutes.js');
const PolygonAPIRouter = require('./api/APIRoutes/PolygonRoutes.js');
const RegionAPIRouter = require('./api/APIRoutes/RegionRoutes.js');
const FileAPIRouter = require('./api/APIRoutes/FileRoutes.js');

router.use( frontendRouter );
router.use('/api', CustomAPIRouter);
router.use('/api', MapAPIRouter);
router.use('/api', PolygonAPIRouter);
router.use('/api', RegionAPIRouter);
router.use('/api', FileAPIRouter);

module.exports = router;