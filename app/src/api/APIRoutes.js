const express = require('express');

const APIRouter = express.Router();

APIRouter.use( express.json() );

const { TokenMiddleware, generateToken, removeToken } = require('../middleware/tokenMiddleware.js');
const ShapeDAO = require('./db/ShapeDAO.js');
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
    CustomDAO.printShapeInsertQuery().then( r => {
        res.json( r );
    }).catch ( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /customPrint/:method'});
    });
});

// ----- ShapeDAO ROUTES -----

APIRouter.get('/shapes', (req, res) => {
    ShapeDAO.getShapes().then( shapes => {
        res.json( shapes );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /shapes'});
    });
});

APIRouter.get('/shapes/:shapeId', (req, res) => {
    ShapeDAO.getShapeById( req.params.shapeId ).then( shape => {
        res.json( shape );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /shapes/:shapeId'});
    });
});

APIRouter.get('/shapes/:mapId/:parent/:name', (req, res) => {
    const shapeData = {
        mapShape_map_id : req.params.mapId,
        mapShape_parent : req.params.parent,
        shape_name : req.params.name.split('_').join(' ')
    };
    ShapeDAO.getShapeByMapIdParentName( shapeData ).then( shape => {
        res.json( shape );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /shapes/:mapId/:parent/:name'});
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

APIRouter.get('/mapShape/parents/:mapId', (req, res) => {
    ShapeDAO.getShapeParentsForMap( req.params.mapId ).then( parents => {
        res.json( parents );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with POST request to /mapShape'});
    });
});

APIRouter.get('/mapShape/:mapId/:shapeId', (req, res) => {
    ShapeDAO.getMapShape( req.params.mapId, req.params.shapeId ).then( shape => {
        res.json( shape );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with POST request to /mapShape'});
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

APIRouter.post('/mapShape', (req, res) => {
    ShapeDAO.createMapShape( req.body ).then( mapShape => {
        res.json( mapShape );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with POST request to /mapShape'});
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

module.exports = APIRouter;