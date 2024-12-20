const express = require('express');
const router = express.Router();

const frontendRouter = require('./frontend/frontendRoutes.js');
const APIRouter = require('./api/APIRoutes.js');

router.use( frontendRouter );
router.use('/api', APIRouter);

module.exports = router;