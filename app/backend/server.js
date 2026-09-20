import express from "express";
import router from "./router.js";
import path from "path";
import fs from "fs";

const PORT = process.env.PORT || 3000;

const app = express();
app.use( express.json({ limit: '10mb' }) );
app.use( router );
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