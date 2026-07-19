const express = require('express');

const RegionDAO = require('../db/RegionDAO.js');
const BackendPayloadManager = require('../../middleware/BackendPayloadManager.js');

const FrontendMapRegion = require('../models/FrontendMapRegion.js');
const Region = require('../models/Region.js');

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

RegionAPIRouter.get('/regions/map/:mapId', (req, res) => {
    RegionDAO.getRegionsByMapId( req.params.mapId ).then( async regions => {
        const parentIds = new Set( regions.map( region => region.region_parent_id ) );
        const parentRegions = await Promise.all( [...parentIds].map( id => {
            return RegionDAO.getRegionById( id );
        }));
        res.json({
            mapRegions : regions,
            parentRegions : parentRegions
        });
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

RegionAPIRouter.get('/mapRegion/:mapId/:regionId', (req, res) => {
    RegionDAO.getMapRegion( req.params.mapId, req.params.regionId ).then( region => {
        res.json( region );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /mapRegion/:mapId/:regionId'});
    });
});

RegionAPIRouter.post('/regions', BackendPayloadManager.chunkMiddleware, (req, res) => {
    const region =  new FrontendMapRegion( req.body );
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
RegionAPIRouter.put('/regions/setParent/:start/:end/:parentId', async (req, res) => {
    const startId = Number( req.params.start );
    const endId = Number( req.params.end );
    const region_parent_id = Number( req.params.parentId );
    await RegionDAO.setRegionParentId_range( startId, endId, region_parent_id ).then( affectedRows => {
        res.json({ affectedRows: affectedRows });
    }).catch( err => {
        res.status(500).json({error:err, message: 'Error with PUT request to /regions/setParent/:start/:end/:parentId'});
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