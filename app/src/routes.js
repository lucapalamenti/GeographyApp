const express = require('express');
const router = express.Router();

const frontendRouter = require('./frontend/frontendRoutes.js');

router.use( frontendRouter );

module.exports = router;