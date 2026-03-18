const express = require('express');
const multer = require('multer');

const FileAPIRouter = express.Router();
FileAPIRouter.use( express.json() );

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback( null, 'uploads/' );
    },
    filename: (req, file, callback) => {
        callback( null, `${Date.now()}-${file.originalname}` );
    }
});
const upload = multer({ storage });
FileAPIRouter.post('/uploadFile', upload.single('outlineData'), (req, res) => {
    if (req.file) {
        res.json({ message: 'File uploaded successfully', filename: req.file.filename });
    } else {
        res.status(400).json({ message: 'No file uploaded' });
    }
});

module.exports = FileAPIRouter;