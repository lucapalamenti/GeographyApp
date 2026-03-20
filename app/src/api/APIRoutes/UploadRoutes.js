const express = require('express');
const multer = require('multer');
const path = require("path");

const UploadAPIRouter = express.Router();
UploadAPIRouter.use( express.json() );

const storage = multer.diskStorage({
    // directory to store in
    destination: ( req, file, callback ) => {
        callback( null, path.join(process.cwd(), "uploads", "thumbnails", "custom") );
    },
    // name of file
    filename: ( req, file, callback ) => {
        callback( null, `${Date.now()}-${file.originalname}` );
    }
});
const thumbnailUpload = multer({ storage });

UploadAPIRouter.post('/thumbnail', thumbnailUpload.single('thumbnail'), (req, res) => {
    if ( req.file ) {
        const filePath = `/uploads/thumbnails/custom/${req.file.filename}`;
        res.json({ message: `File uploaded successfully to:${filePath}`, filename: `custom/${req.file.filename}` });
    } else {
        res.status(400).json({ message: 'No file uploaded' });
    }
});

// const upload = multer({ dest: 'uploads/' });
UploadAPIRouter.post('/shapefile', (req, res) => {

});

module.exports = UploadAPIRouter;