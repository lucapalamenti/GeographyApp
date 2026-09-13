import { Router, json } from 'express';

import { getMaps, getMapById, createMap, updateMap, deleteAllCustomMaps, deleteMap } from '../db/MapDAO.js';
import BackendPayloadManager from '../../middleware/BackendPayloadManager.js';
import MMap from '../models/MMap.js';
import util from '../util/util.js';

const MapAPIRouter = Router();
MapAPIRouter.use( json() );

MapAPIRouter.get('/maps/type/:type/sort/:sort/desc/:desc', (req, res) => {
    const p = req.params;
    getMaps( p.type, p.sort, p.desc ).then( maps => {
        res.json( maps );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /maps'});
    });
});

MapAPIRouter.get('/maps/:mapId', (req, res) => {
    getMapById( req.params.mapId ).then( map => {
        res.json( map );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with GET request to /maps/:mapId'});
    });
});

MapAPIRouter.post('/maps', BackendPayloadManager.chunkMiddleware, (req, res) => {
    const map = new MMap( req.body );
    createMap( map ).then( returnedMap => {
        res.json( returnedMap );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with POST request to /maps'});
    });
});

MapAPIRouter.put('/maps', BackendPayloadManager.chunkMiddleware, (req, res) => {
    const map = new MMap( req.body );
    updateMap( map ).then( map => {
        res.json( map );
    })
    .catch( err => {
        res.status(500).json({error:err, message: 'Error with PUT request to /maps'});
    });
});

MapAPIRouter.delete('/maps', (req, res) => {
    deleteAllCustomMaps().then( deletedMapCount => {
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
    const returnedMap = await getMapById( mapId ).catch( err => {
        return res.status(404).json( err );
    });

    // If the map is a template then we also need to delete all maps that reference regions from this template
    if ( returnedMap.map_is_template ) {

    }

    await deleteMap( mapId ).catch( err => {
        return res.status(500).json({error:err, message: 'Error with DELETE request to /maps/:mapId'});
    });

    // Stop from deleting default maps
    if ( !returnedMap.map_thumbnail.startsWith( "default" ) ) {
        // Once the map is successfully deleted we can delete the thumbnail
        util.deleteFileFromDirectory("/app/uploads/thumbnails", returnedMap.map_thumbnail ).catch( err => {
            // Log error but don't return error
            console.error( `Couldn't delete thumbnail for map ${mapId}`, err )
        });
    }
    

    res.json({message: `Map ${mapId} successfully deleted`});
});




export default MapAPIRouter;