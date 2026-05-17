const express = require('express');
const multer = require('multer');
const path = require("path");

const MapDAO = require('../db/MapDAO.js');
const RegionDAO = require('../db/RegionDAO.js');

const MMap = require('../models/MMap.js');
const { SQLGeometry, SQLPolygon, SQLMultiPolygon } = require('../models/SQLGeometry.js');
const FrontendMapRegion = require('../models/FrontendMapRegion.js');

const UploadAPIRouter = express.Router();
UploadAPIRouter.use( express.json() );

const thumbnailStorage = multer.diskStorage({
    // directory to store in
    destination: ( req, file, callback ) => {
        callback( null, path.join(process.cwd(), "uploads", "thumbnails", "custom") );
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

const mapfileUpload = multer({ storage: multer.memoryStorage() });
UploadAPIRouter.post('/mapfile', mapfileUpload.single('mapfile'), async (req, res) => {
    // Check that a valid geojson file was uploaded
    if ( !req.file ) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
    }
    const geojson = JSON.parse( req.file.buffer.toString() );
    const region_type = req.body["region_type"];
    // Check for invalid region type (its not a key in the feature properties)
    if ( !geojson["features"][0]["properties"][region_type] ) {
        res.status(400).json({ message: 'Invalid region_type given' });
        return;
    }
    
    const regionResponses = geojson["features"].map( feature => {
        // Create a Region from each feature
        return RegionDAO.createRegion({
            region_name : feature["properties"][region_type],
            region_type : region_type,
            region_parent_id : null,
            region_points : SQLGeometry.createAnyType( feature["geometry"] )
        });
    });

    // Confirm that all Region and Polygon objects were successfully created
    const objectResponses = await Promise.all( regionResponses ).catch( err => {
        res.status(400).json({ message: "Couldn't create Regions from file", err });
    });
    if ( !objectResponses ) return;
    
    // Create a map for the new data to be seen in
    const map = await MapDAO.createMap( new MMap({
        map_id : null,
        map_name : "Connecticut Municipalities",
        map_thumbnail : "default/Test_Map_Thumbnail.png",
        map_primary_color_R : 0,
        map_primary_color_G : 0,
        map_primary_color_B : 0,
        map_is_custom : true
    }) ).catch( err => {
        res.status(400).json({ message: "Couldn't create map", err });
    });

    const mapRegionResponses = objectResponses.map( region => {
        return RegionDAO.createMapRegion( new FrontendMapRegion({
            mapRegion_map_id : map.map_id,
            mapRegion_region_id : region.region_id,
            mapRegion_parent : "Connecticut",
            mapRegion_offsetX : 0.000000,
            mapRegion_offsetY : 0.000000,
            mapRegion_scaleX : 1.000000,
            mapRegion_scaleY : 1.000000,
            mapRegion_type : "enabled"
        }) );
    });

    const creationResponses = await Promise.all( mapRegionResponses ).catch( err => {
        res.status(400).json({ message: "Couldn't create mapRegions for map", err });
    });

    res.json({
        responses : objectResponses,
        mapRegions : creationResponses
    });
});

module.exports = UploadAPIRouter;