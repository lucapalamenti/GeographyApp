const express = require('express');

const APIRouter = express.Router();

APIRouter.use( express.json() );

const { TokenMiddleware, generateToken, removeToken } = require('../middleware/tokenMiddleware.js');
const ShapeDAO = require('./db/ShapeDAO.js');

APIRouter.get('/shapes', (req, res) => {
    ShapeDAO.getShapes().then( shapes => {
        res.json( shapes );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error getting request to /shapes'});
    });
});

APIRouter.post('/shapes', (req, res) => {
    const data = req.body;
    ShapeDAO.createShape( data.shape_map_id, data.shape_name, data.shape_points );
});

module.exports = APIRouter;