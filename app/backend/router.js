import express from 'express';

import frontendRouter from './frontendRoutes.js';
import CustomAPIRouter from './api/APIRoutes/CustomRoutes.js';
import MapAPIRouter from './api/APIRoutes/MapRoutes.js';
import RegionAPIRouter from './api/APIRoutes/RegionRoutes.js';
import UploadAPIRouter from './api/APIRoutes/UploadRoutes.js';

const router = express.Router();
router.use( frontendRouter );
router.use('/api', CustomAPIRouter);
router.use('/api', MapAPIRouter);
router.use('/api', RegionAPIRouter);
router.use('/api/upload', UploadAPIRouter);

export default router;