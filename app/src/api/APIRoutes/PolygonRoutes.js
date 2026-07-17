const express = require('express');

const PolygonDAO = require('../db/PolygonDAO.js');
const BackendPayloadManager = require('../../middleware/BackendPayloadManager.js');
const Polygon = require('../db/models/Polygon.js');

const PolygonAPIRouter = express.Router();
PolygonAPIRouter.use( express.json() );

PolygonAPIRouter.get('/polygons/:polygonId', (req, res) => {
    PolygonDAO.getPolygonById( req.params.polygonId ).then( returnedPolygon => {
        res.json( returnedPolygon );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /polygons/:polygonId'});
    });
});

PolygonAPIRouter.get('/polygons/regionId/:regionId', (req, res) => {
    PolygonDAO.getPolygonsByRegionId( req.params.regionId ).then( returnedPolygons => {
        res.json( returnedPolygons );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /polygons/regionId/:regionId'});
    });
});

PolygonAPIRouter.get('/polygons/mapId/:mapId', (req, res) => {
    PolygonDAO.getPolygonsByMapId( req.params.mapId ).then( returnedPolygons => {
        res.json( returnedPolygons );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /polygons/regionId/:regionId'});
    });
});

PolygonAPIRouter.post('/polygons', BackendPayloadManager.chunkMiddleware, (req, res) => {
    const polygon = new Polygon( req.body );
    PolygonDAO.createPolygon( polygon ).then( createdPolygon => {
        res.json( createdPolygon );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with POST request to /polygons'});
    });
});

PolygonAPIRouter.delete('/polygons', (req, res) => {
    PolygonDAO.deleteAllPolygons().then( numAffectedRows => {
        res.json( numAffectedRows );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with POST request to /polygons'});
    });
});

module.exports = PolygonAPIRouter;