const express = require('express');

const MapDAO = require('../db/MapDAO.js');
const BackendPayloadManager = require('../../middleware/BackendPayloadManager.js');
const Map = require('../db/models/MMap.js');

const MapAPIRouter = express.Router();
MapAPIRouter.use( express.json() );

MapAPIRouter.get('/maplist/where/:where/orderBy/:orderBy', (req, res) => {
    MapDAO.getMaps( req.params.where, req.params.orderBy ).then( maps => {
        res.json( maps );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /maps'});
    });
});

MapAPIRouter.get('/maps/:mapId', (req, res) => {
    MapDAO.getMapById( req.params.mapId ).then( map => {
        res.json( map );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /maps/:mapId'});
    });
});

MapAPIRouter.post('/maps', BackendPayloadManager.chunkMiddleware, (req, res) => {
    const map = new Map( req.body );
    MapDAO.createMap( map ).then( map => {
        res.json( map );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with POST request to /maps'});
    });
});

MapAPIRouter.put('/maps', BackendPayloadManager.chunkMiddleware, (req, res) => {
    const map = new Map( req.body );
    MapDAO.updateMap( map ).then( map => {
        res.json( map );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with PUT request to /maps'});
    });
});

MapAPIRouter.delete('/maps', (req, res) => {
    MapDAO.deleteAllCustomMaps().then( deletedMaps => {
        res.json({deletedMaps:deletedMaps});
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with DELETE request to /maps/:mapId'});
    });
});

MapAPIRouter.delete('/maps/:mapId', (req, res) => {
    MapDAO.deleteMap( req.params.mapId ).then( deletedMaps => {
        res.json({deletedMaps:deletedMaps});
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with DELETE request to /maps/:mapId'});
    });
});

module.exports = MapAPIRouter;