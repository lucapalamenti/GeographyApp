const express = require('express');

const APIRouter = express.Router();

APIRouter.use( express.json() );

const { TokenMiddleware, generateToken, removeToken } = require('../middleware/tokenMiddleware.js');
const ShapeDAO = require('./db/ShapeDAO.js');
const MapDAO = require('./db/MapDAO.js');

APIRouter.get('/shapes', (req, res) => {
    ShapeDAO.getShapes().then( shapes => {
        res.json( shapes );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /shapes'});
    });
});

APIRouter.post('/shapes', (req, res) => {
    ShapeDAO.createShape( req.body ).then( shape => {
        res.json( shape );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with POST request to /shapes'});
    });
});

APIRouter.put('/shapes', (req, res) => {
    ShapeDAO.updatePoints( req.body ).then( shape => {
        res.json( shape );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with PUT request to /shapes'});
    });
});

APIRouter.put('/shapes/points', (req, res) => {
    ShapeDAO.appendPoints( req.body ).then( shape => {
        res.json( shape );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with PUT request to /shapes/points'});
    });
});

APIRouter.get('/shapes/map/:mapId', (req, res) => {
    ShapeDAO.getShapesByMapId( req.params.mapId ).then( shapes => {
        res.json( shapes );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with DELETE request to /shapes/map/:mapId'});
    });
});

APIRouter.delete('/shapes/map/:mapId', (req, res) => {
    ShapeDAO.deleteShapesFromMap( req.params.mapId ).then( affectedRows => {
        res.json( affectedRows );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with DELETE request to /shapes/map/:mapId'});
    });
});

APIRouter.get('/maps', (req, res) => {
    MapDAO.getMaps().then( maps => {
        res.json( maps );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /maps'});
    });
});

APIRouter.get('/maps/:mapId', (req, res) => {
    MapDAO.getMapById( req.params.mapId ).then( map => {
        res.json( map );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /maps/:mapId'});
    });
});

module.exports = APIRouter;