const express = require('express');

const APIRouter = express.Router();

APIRouter.use( express.json() );

const { TokenMiddleware, generateToken, removeToken } = require('../middleware/tokenMiddleware.js');
const RegionDAO = require('./db/RegionDAO.js');
const MapDAO = require('./db/MapDAO.js');
const CustomDAO = require('./db/CustomDAO.js');

// ----- CustomDAO ROUTES -----

APIRouter.get('/custom', (req, res) => {
    CustomDAO.custom().then( r => {
        res.json( r );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /custom'});
    });
});

APIRouter.post('/customPrint', (req, res) => {
    CustomDAO.printRegionInsertQuery().then( r => {
        res.json( r );
    }).catch ( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /customPrint'});
    });
});

// ----- RegionDAO ROUTES -----

APIRouter.get('/regions', (req, res) => {
    RegionDAO.getRegions().then( regions => {
        res.json( regions );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /regions'});
    });
});

APIRouter.get('/regions/:regionId', (req, res) => {
    RegionDAO.getRegionById( req.params.regionId ).then( region => {
        res.json( region );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /regions/:regionId'});
    });
});

APIRouter.get('/regions/:mapId/:parent/:name', (req, res) => {
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

APIRouter.get('/regions/map/:mapId', (req, res) => {
    RegionDAO.getRegionsByMapId( req.params.mapId ).then( regions => {
        res.json( regions );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with DELETE request to /regions/map/:mapId'});
    });
});

APIRouter.get('/mapRegion/parents/:mapId', (req, res) => {
    RegionDAO.getRegionParentsForMap( req.params.mapId ).then( parents => {
        res.json( parents );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with POST request to /mapRegion'});
    });
});

APIRouter.get('/mapRegion/:mapId/:regionId', (req, res) => {
    RegionDAO.getMapRegion( req.params.mapId, req.params.regionId ).then( region => {
        res.json( region );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with POST request to /mapRegion'});
    });
});

APIRouter.post('/regions', (req, res) => {
    RegionDAO.createRegion( req.body ).then( region => {
        res.json( region );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with POST request to /regions'});
    });
});

APIRouter.post('/mapRegion', (req, res) => {
    RegionDAO.createMapRegion( req.body ).then( mapRegion => {
        res.json( mapRegion );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with POST request to /mapRegion'});
    });
});

APIRouter.delete('/regions/map/:mapId', (req, res) => {
    RegionDAO.deleteRegionsFromMap( req.params.mapId ).then( affectedRows => {
        res.json( affectedRows );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with DELETE request to /regions/map/:mapId'});
    });
});

// ----- MapDAO ROUTES -----

APIRouter.get('/maplist/:orderBy', (req, res) => {
    MapDAO.getMaps( req.params.orderBy ).then( maps => {
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

APIRouter.post('/maps', (req, res) => {
    MapDAO.createMap( req.body ).then( map => {
        res.json( map );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with POST request to /maps'});
    });
});

APIRouter.put('/maps', (req, res) => {
    MapDAO.updateMap( req.body ).then( map => {
        res.json( map );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with PUT request to /maps'});
    });
});

APIRouter.delete('/maps/:mapId', (req,res) => {
    MapDAO.deleteMap( req.params.mapId ).then( deletedMaps => {
        res.json({deletedMaps:deletedMaps});
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with DELETE request to /maps/:mapId'});
    });
});

module.exports = APIRouter;