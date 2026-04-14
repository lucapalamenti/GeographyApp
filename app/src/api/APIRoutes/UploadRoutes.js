const express = require('express');
const multer = require('multer');
const path = require("path");

const UploadAPIRouter = express.Router();
UploadAPIRouter.use( express.json() );

const thumbnailStorage = multer.diskStorage({
    // directory to store in
    destination: ( req, file, callback ) => {
        callback( null, path.join(process.cwd(), "uploads", "thumbnails", "custom") );
    },
    // name of file
    filename: ( req, file, callback ) => {
        callback( null, `${Date.now()}-${file.originalname}` );
    }
});
const thumbnailUpload = multer({ thumbnailStorage });

UploadAPIRouter.post('/thumbnail', thumbnailUpload.single('thumbnail'), (req, res) => {
    if ( req.file ) {
        const filePath = `/uploads/thumbnails/custom/${req.file.filename}`;
        res.json({ message: `File uploaded successfully to:${filePath}`, filename: `custom/${req.file.filename}` });
    } else {
        res.status(400).json({ message: 'No file uploaded' });
    }
});

const mapfileUpload = multer({ storage: multer.memoryStorage() });
UploadAPIRouter.post('/mapfile', mapfileUpload.single('mapfile'), (req, res) => {
    if ( req.file ) {
        const content = req.file.buffer.toString();
        console.log( content );
        res.json({ message: "AAAAA" });
    } else {
        res.status(400).json({ message: 'No file uploaded' });
    }
});

module.exports = UploadAPIRouter;