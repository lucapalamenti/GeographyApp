const database = require('./databaseConnections.js');

const Polygon = require('./models/Polygon.js');

const getPolygonById = async ( polygon_id ) => {
    return await database.query(`
        SELECT * FROM polygon
        WHERE polygon_id = ?;
        `, [polygon_id]).then( rows => {
            if ( rows.length === 1 ) {
                return new Polygon( rows[0] );
            }
            throw new Error("Polygon not found!");
    });
}

/**
 * 
 * @param {Polygon} polygon 
 */
const createPolygon = async ( polygon ) => {
    const { polygon_region_id, polygon_is_enclave, polygon_enclave_of_region_id, polygon_points } = polygon;
    return await database.query(`
        INSERT INTO polygon (polygon_region_id, polygon_is_enclave, polygon_enclave_of_region_id, polygon_points)
        VALUES (?, ?, ?, ST_GEOMFROMTEXT(?));
        `, [polygon_region_id, polygon_is_enclave, polygon_enclave_of_region_id, polygon_points.toQueryString()]).then( rows => {
        if ( rows.affectedRows === 1 ) {
            return getPolygonById( rows.insertId );
        }
        throw new Error("Polygon could not be created!");
    });
};

module.exports = {
    getPolygonById,
    createPolygon
};