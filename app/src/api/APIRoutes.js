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
    ShapeDAO.createShape( req.body ).then( shape => {
        res.json( shape );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error creating shape'});
    });
});

APIRouter.put('/shapes', (req, res) => {
    ShapeDAO.updatePoints( req.body ).then( shape => {
        res.json( shape );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error updating shape'});
    })
});

APIRouter.put('/shapes/points', (req, res) => {
    ShapeDAO.appendPoints( req.body ).then( shape => {
        res.json( shape );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error updating shape'});
    })
});

module.exports = APIRouter;