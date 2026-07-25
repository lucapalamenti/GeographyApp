const express = require('express');
const frontendRouter = express.Router();

// Designate the static folder as serving static resources
frontendRouter.use(express.static('frontend/static'));

const templates_dir = "/app/frontend/templates/";

frontendRouter.get('/', (req, res) => {
    res.sendFile(`${templates_dir}index.html`);
});

frontendRouter.get('/game', (req, res) => {
    res.sendFile(`${templates_dir}game.html`);
});

frontendRouter.get('/create', (req, res) => {
    res.sendFile(`${templates_dir}create.html`);
});

frontendRouter.get('/admin', (req, res) => {
    res.sendFile(`${templates_dir}admin.html`);
});

module.exports = frontendRouter;