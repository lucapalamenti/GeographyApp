const express = require('express');
const multer = require('multer');

const UploadAPIRouter = express.Router();
UploadAPIRouter.use( express.json() );

// const storage = multer.diskStorage({
//     destination: (req, file, callback) => {
//         callback( null, 'uploads/' );
//     },
//     filename: (req, file, callback) => {
//         callback( null, `${Date.now()}-${file.originalname}` );
//     }
// });
// const upload = multer({ storage });
const upload = multer({ dest: 'uploads/' });
UploadAPIRouter.post('/uploadFile', upload.single('outlineData'), (req, res) => {
    if (req.file) {
        res.json({ message: 'File uploaded successfully', filename: req.file.filename });
    } else {
        res.status(400).json({ message: 'No file uploaded' });
    }
});

UploadAPIRouter.post('/', (req, res) => {

});

module.exports = UploadAPIRouter;