const express = require('express');

const MapDAO = require('../db/MapDAO.js');
const BackendPayloadManager = require('../../middleware/BackendPayloadManager.js');
const Map = require('../db/models/MMap.js');
const util = require('../db/backend/util.js');

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
    MapDAO.deleteAllCustomMaps().then( deletedMapCount => {
        // Remove all thumbnails for custom maps
        util.deleteAllFilesInDirectory( "/app/uploads/thumbnails/custom" );
        res.json({ message: `All ${deletedMapCount} custom maps deleted` });
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with DELETE request to /maps/:mapId'});
    });
});

MapAPIRouter.delete('/maps/:mapId', async (req, res) => {
    const mapId = req.params.mapId;
    // First get the map so we know what thumbnail to delete
    const returnedMap = await MapDAO.getMapById( mapId ).catch( err => {
        return res.status(404).json( err );
    });

    await MapDAO.deleteMap( mapId ).catch( err => {
        return res.status(500).json({error:err, message: 'Error with DELETE request to /maps/:mapId'});
    });

    // Once the map is successfully deleted we can delete the thumbnail
    util.deleteFileFromDirectory("/app/uploads/thumbnails", returnedMap.map_thumbnail ).catch( err => {
        // Log error but don't return error
        console.error( `Couldn't delete thumbnail for map ${mapId}`, err )
    });

    res.json({message: `Map ${mapId} successfully deleted`});
});




module.exports = MapAPIRouter;