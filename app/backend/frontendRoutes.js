const express = require('express');
const frontendRouter = express.Router();

// Designate the static folder as serving static resources
frontendRouter.use(express.static('static'));

const html_dir = "/app/templates/";

frontendRouter.get('/', (req, res) => {
    res.sendFile(`${html_dir}index.html`);
});

frontendRouter.get('/game', (req, res) => {
    res.sendFile(`${html_dir}game.html`);
});

frontendRouter.get('/create', (req, res) => {
    res.sendFile(`${html_dir}create.html`);
});

frontendRouter.get('/admin', (req, res) => {
    res.sendFile(`${html_dir}admin.html`);
});

module.exports = frontendRouter;