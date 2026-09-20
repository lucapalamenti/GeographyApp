import { Router, json } from 'express';

import { getRegions, getRegionById, getRegionsByMapId, getParentRegionsByMapId, getMapRegionStates, getMapRegion, createRegion, createMapRegion, setRegionParentId_range, deleteRegion_range } from '../db/RegionDAO.js';
import BackendPayloadManager from '../../middleware/BackendPayloadManager.js';

import Region from '../models/Region.js';
import MapRegion from '../models/MapRegion.js';

const RegionAPIRouter = Router();
RegionAPIRouter.use( json() );

RegionAPIRouter.get('/regions', (req, res) => {
    getRegions().then( regions => {
        res.json( regions );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /regions'});
    });
});

RegionAPIRouter.get('/regions/:regionId', (req, res) => {
    getRegionById( req.params.regionId ).then( region => {
        res.json( region );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /regions/:regionId'});
    });
});

RegionAPIRouter.get('/regions/map/:mapId', async (req, res) => {
    try {
        res.json({
            mapRegions : await getRegionsByMapId( req.params.mapId ),
            parentRegions : await getParentRegionsByMapId( req.params.mapId )
        });
    } catch ( err ) {
        res.status(500).json({error:err, message: 'Error with GET request to /regions/map/:mapId'});
    }
});

RegionAPIRouter.get('/regions/parents/:mapId', (req, res) => {
    getParentRegionsByMapId( Number( req.params.mapId ) ).then( parents => {
        res.json( parents );
    }).catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /regions/parents/:mapId'});
    });
});

RegionAPIRouter.get('/mapRegion/states', (req, res) => {
    getMapRegionStates().then( states => {
        res.json( states );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /mapRegion/states'});
    });
});

RegionAPIRouter.get('/mapRegion/:mapId/:regionId', (req, res) => {
    getMapRegion( req.params.mapId, req.params.regionId ).then( region => {
        res.json( region );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /mapRegion/:mapId/:regionId'});
    });
});

RegionAPIRouter.post('/regions', BackendPayloadManager.chunkMiddleware, (req, res) => {
    const region =  new Region( req.body );
    createRegion( region ).then( region => {
        res.json( region );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with POST request to /regions'});
    });
});

RegionAPIRouter.post('/mapRegion', BackendPayloadManager.chunkMiddleware, (req, res) => {
    console.log( req.body );
    /**
     * @type {MapRegionJoinData}
     */
    const mapRegionData = req.body;

    createMapRegion( mapRegionData ).then( mapRegion => {
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
    await setRegionParentId_range( startId, endId, region_parent_id ).then( affectedRows => {
        res.json({ affectedRows: affectedRows });
    }).catch( err => {
        res.status(500).json({error:err, message: 'Error with PUT request to /regions/setParent/:start/:end/:parentId'});
    });
});

RegionAPIRouter.delete('/regions/start/:start/end/:end', (req, res) => {
    console.log( req.params );
    const startId = Number( req.params.start );
    const endId = Number( req.params.end );
    deleteRegion_range( startId, endId ).then( affectedRows => {
        res.json({ affectedRows : affectedRows });
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with DELETE request to /regions/map/:mapId'});
    });
});

export default RegionAPIRouter;