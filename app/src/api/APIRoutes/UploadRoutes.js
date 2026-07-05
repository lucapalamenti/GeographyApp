const express = require('express');
const multer = require('multer');
const Path = require("path");
const { JSDOM } = require('jsdom');

const MapDAO = require('../db/MapDAO.js');
const RegionDAO = require('../db/RegionDAO.js');
const BackendPayloadManager = require('../../middleware/BackendPayloadManager.js');
const Kml2Geojson = require('../util/kml2geojson.js');

const MMap = require('../models/MMap.js');
const { SQLGeometry, SQLPolygon, SQLMultiPolygon } = require('../models/SQLGeometry.js');
const FrontendMapRegion = require('../models/FrontendMapRegion.js');
const { FeatureCollection } = require('../models/FeatureCollection.js');
const TemplateMap = require('../models/TemplateMap.js');

const UploadAPIRouter = express.Router();
UploadAPIRouter.use( express.json() );

const thumbnailStorage = multer.diskStorage({
    // directory to store in
    destination: ( req, file, callback ) => {
        callback( null, Path.join(process.cwd(), "uploads", "thumbnails", "custom") );
    },
    // name of file
    filename: ( req, file, callback ) => {
        callback( null, `${Date.now()}-${file.originalname}` );
    }
});
const thumbnailUpload = multer({ storage: thumbnailStorage });

UploadAPIRouter.post('/thumbnail', thumbnailUpload.single('thumbnail'), (req, res) => {
    if ( !req.file ) {
        res.status(400).json({ message: 'No file uploaded' });
    } else if ( !req.file.filename ) {
        res.status(400).json({ message: "Can't read file.filename" });
    } else {
        const filePath = `/uploads/thumbnails/custom/${req.file.filename}`;
        res.json({ message: `File uploaded successfully to:${filePath}`, filename: `custom/${req.file.filename}` });
    }
});

// ----- <<<<< MAPFILE >>>>> -----

const mapfileUpload = multer({ storage: multer.memoryStorage() });
UploadAPIRouter.post('/mapfile/process', mapfileUpload.single('mapfile'), async (req, res) => {
    // Check that a file was uploaded
    if ( !req.file ) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
    }
    
    let geojson;

    const fileExt = req.file.originalname.split( "." ).pop();
    switch ( fileExt ) {
        case "geojson":
            geojson = JSON.parse( req.file.buffer.toString() );
            break;
        case "kml":
            const dom = new JSDOM( req.file.buffer.toString(), {contentType: "text/xml"} );
            geojson = Kml2Geojson.parse( dom.window.document );
            break;
        default:
            res.status(400).json({ message: `The given file extension "${fileExt}" cannot be converted to geojson!` });
            return;
    }
    res.json( geojson );
});

UploadAPIRouter.post('/mapfile/create', BackendPayloadManager.chunkMiddleware, async (req, res) => {
    // Validate that the required parameters are given
    let fieldData;
    try {
        fieldData = new TemplateMap( req.body );
    } catch ( err ) {
        res.status(200).json({ message: 'All required TemplateMap fields are not populated!' });
    }

    let featureCollection = fieldData.new_feature_collection;

    // Check for invalid region type (its not a key in the feature properties)
    if ( !featureCollection.getProperties()[fieldData.region_name_key] ) {
        res.status(400).json({ message: 'Invalid region_name_key given' });
        return;
    }


    // Confirm that all Region and Polygon objects were successfully created
    const objectResponses = await Promise.all( featureCollection.features.map( feature => {
        // Create a Region from each feature
        return RegionDAO.createRegion({
            region_name : feature.properties[fieldData.region_name_key],
            region_type : fieldData.region_type,
            region_parent_id : null,
            region_points : SQLGeometry.createAnyType( feature["geometry"] )
        });
    })).catch( err => {
        res.status(400).json({ message: "Couldn't create Regions from file", err });
    });
    if ( !objectResponses ) return;
    
    // Create a map for the new data to be seen in
    const map = await MapDAO.createMap( new MMap({
        map_id : null,
        map_name : fieldData.map_name,
        map_thumbnail : "default/Template_Map_Thumbnail.png",
        map_primary_color_R : 0,
        map_primary_color_G : 0,
        map_primary_color_B : 0,
        map_is_template : true,
        map_is_custom : true
    }) ).catch( err => {
        res.status(400).json({ message: "Couldn't create map", err });
    });

    const creationResponses = await Promise.all( objectResponses.map( region => {
        return RegionDAO.createMapRegion( new FrontendMapRegion({
            mapRegion_map_id : map.map_id,
            mapRegion_region_id : region.region_id,
            mapRegion_parent : null,
            mapRegion_offsetX : 0.000000,
            mapRegion_offsetY : 0.000000,
            mapRegion_scaleX : 1.000000,
            mapRegion_scaleY : 1.000000,
            mapRegion_type : "enabled"
        }) );
    })).catch( err => {
        res.status(400).json({ message: "Couldn't create mapRegions for map", err });
    });

    res.status(200).json({
        responses : objectResponses,
        mapRegions : creationResponses
    });
});

module.exports = UploadAPIRouter;