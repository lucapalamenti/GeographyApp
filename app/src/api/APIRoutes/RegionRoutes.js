const express = require('express');

const RegionDAO = require('../db/RegionDAO.js');
const BackendPayloadManager = require('../../middleware/BackendPayloadManager.js');

const FrontendMapRegion = require('../db/models/FrontendMapRegion.js');
const Region = require('../db/models/Region.js');

const RegionAPIRouter = express.Router();
RegionAPIRouter.use( express.json() );

RegionAPIRouter.get('/regions', (req, res) => {
    RegionDAO.getRegions().then( regions => {
        res.json( regions );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /regions'});
    });
});

RegionAPIRouter.get('/regions/:regionId', (req, res) => {
    RegionDAO.getRegionById( req.params.regionId ).then( region => {
        res.json( region );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /regions/:regionId'});
    });
});

RegionAPIRouter.get('/regions/:mapId/:parent/:name', (req, res) => {
    const regionData = {
        mapRegion_map_id : req.params.mapId,
        mapRegion_parent : req.params.parent,
        region_name : req.params.name.split('_').join(' ')
    };
    RegionDAO.getRegionByMapIdParentName( regionData ).then( region => {
        res.json( region );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /regions/:mapId/:parent/:name'});
    });
});

RegionAPIRouter.get('/regions/map/:mapId', (req, res) => {
    RegionDAO.getRegionsByMapId( req.params.mapId ).then( regions => {
        res.json( regions );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /regions/map/:mapId'});
    });
});

RegionAPIRouter.get('/mapRegion/states', (req, res) => {
    RegionDAO.getMapRegionStates().then( states => {
        res.json( states );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /mapRegion/states'});
    });
});

RegionAPIRouter.get('/mapRegion/parents/:mapId', (req, res) => {
    RegionDAO.getRegionParentsForMap( req.params.mapId ).then( parents => {
        res.json( parents );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /mapRegion/parents/:mapId'});
    });
});

RegionAPIRouter.get('/mapRegion/:mapId/:regionId', (req, res) => {
    RegionDAO.getMapRegion( req.params.mapId, req.params.regionId ).then( region => {
        res.json( region );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /mapRegion/:mapId/:regionId'});
    });
});

RegionAPIRouter.post('/regions', BackendPayloadManager.chunkMiddleware, (req, res) => {
    const region =  new FrontendMapRegion(req.body );
    RegionDAO.createRegion( region ).then( region => {
        res.json( region );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with POST request to /regions'});
    });
});

RegionAPIRouter.post('/mapRegion', BackendPayloadManager.chunkMiddleware, (req, res) => {
    const mapRegion = new FrontendMapRegion( req.body );
    RegionDAO.createMapRegion( mapRegion ).then( mapRegion => {
        res.json( mapRegion );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with POST request to /mapRegion'});
    });
});

RegionAPIRouter.delete('/regions/map/:mapId', (req, res) => {
    RegionDAO.deleteRegionsFromMap( req.params.mapId ).then( affectedRows => {
        res.json( affectedRows );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with DELETE request to /regions/map/:mapId'});
    });
});

module.exports = RegionAPIRouter;