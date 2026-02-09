const express = require('express');
const routes = require('./routes');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use( routes );

// Ask the server to listen for incoming connections
app.listen( PORT, () => {
    console.log( `Server listening on port: ${PORT}` );
});