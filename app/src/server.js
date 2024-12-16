const express = require('express');
const app = express();

const routes = require('./routes');
app.use( routes );

const PORT = process.env.PORT || 3000;

// Ask the server to listen for incoming connections
app.listen( PORT, () => {
    console.log( `Server listening on port: ${PORT}` );
});