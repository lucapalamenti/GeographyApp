const database = require('./databaseConnections.js');
const MapRegionPolygon = require('./models/MapRegionPolygon.js');

const Polygon = require('./models/Polygon.js');

/**
 * 
 * @param {Number} polygon_id 
 * @returns {Polygon}
 */
const getPolygonById = async ( polygon_id ) => {
    return await database.query(`
        SELECT * FROM polygon
        WHERE polygon_id = ?;
        `, [polygon_id])
        .then( rows => {
            if ( rows.length === 1 ) {
                return new Polygon( rows[0] );
            }
            throw new Error("Polygon not found!");
    });
};

/**
 * 
 * @param {Number} region_id 
 * @returns {Array<Polygon>}
 */
const getPolygonsByRegionId = async ( region_id ) => {
    return await database.query(`
        SELECT * FROM polygon
        WHERE polygon_region_id = ?;
        `, [region_id])
        .then( rows => {
            return rows.map( row => {
                return new Polygon( row );
            });
    });
};

/**
 * 
 * @param {Number} map_id 
 * @returns {Array<Polygon>}
 */
const getPolygonsByMapId = async ( map_id ) => {
    return await database.query(`
        SELECT * FROM polygon
        JOIN region ON polygon_region_id = region_id
        JOIN mapRegion ON region_id = mapRegion_region_id
        WHERE mapRegion_map_id = ?
        ORDER BY polygon_id;
        `, [map_id])
        .then( rows => {
            return rows.map( row => {
                return new MapRegionPolygon( row );
            });
    });
};

/**
 * 
 * @param {Polygon} polygon 
 * @returns {Polygon}
 */
const createPolygon = async ( polygon ) => {
    const { polygon_region_id, polygon_is_enclave, polygon_enclave_of_polygon_id, polygon_points } = polygon;
    const createdPolygon = await database.query(`
        INSERT INTO polygon (polygon_region_id, polygon_is_enclave, polygon_enclave_of_polygon_id, polygon_points)
        VALUES (?, ?, ?, ST_GEOMFROMTEXT(?));
        `, [polygon_region_id, polygon_is_enclave, polygon_enclave_of_polygon_id, polygon_points.toQueryString()])
        .then( rows => {
            if ( rows.affectedRows === 1 ) {
                return getPolygonById( rows.insertId );
            }
            throw new Error("Polygon could not be created!");
    });
    await createRegionPolygon( polygon_region_id, createdPolygon.polygon_id );
    return createdPolygon;
};

/**
 * Deletes all Polygons and references to polygons in the database and 
 * @returns {Number}
 */
const deleteAllPolygons = async () => {
    await database.query(`
        DELETE FROM regionPolygon;
        `, []);
    return await database.query(`
        DELETE FROM polygon;
        `, [])
        .then( rows => {
            return rows.affectedRows;
    });
};

/**
 * 
 * @param {*} polygon_id 
 */
const deletePolygon = async ( polygon_id ) => {
    await database.query(`
        DELETE FROM polygon
        WHERE polygon_id = ?;
        `, [polygon_id])
        .catch( err => {
            throw new Error( err );
        });
};

const createRegionPolygon = async ( region_id, polygon_id ) => {
    await database.query(`
        INSERT INTO regionPolygon (regionPolygon_region_id, regionPolygon_polygon_id)
        VALUES (?, ?);
        `, [region_id, polygon_id])
        .then( rows => {
            if ( rows.affectedRows === 1 ) {
                return;
            }
            deletePolygon( polygon_id );
            throw new Error("regionPolygon could not be created!");
    });
};

module.exports = {
    getPolygonById,
    getPolygonsByRegionId,
    getPolygonsByMapId,
    createPolygon,
    deleteAllPolygons
};