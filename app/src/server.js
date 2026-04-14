const express = require('express');
const routes = require('./routes');
const path = require('path');
const fs = require("fs");

const PORT = process.env.PORT || 3000;

const app = express();
app.use( express.json({ limit: '10mb' }) );
app.use( routes );
app.use( "/uploads", express.static( path.join( process.cwd(), "uploads" ) ) );

ensureDirectory( path.join(  "uploads", "thumbnails", "custom" ) );

// Ask the server to listen for incoming connections
app.listen( PORT, () => {
    console.log( `Server listening on port: ${PORT}` );
});

/**
 * Checks if a directory exists in the file system and creates it if it doesn't
 * @param {String} directory 
 */
function ensureDirectory( directory ) {
    if ( !fs.existsSync( directory ) ) {
        fs.mkdirSync( directory, { recursive: true } );
    }
}