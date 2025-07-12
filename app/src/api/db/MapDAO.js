const database = require('./databaseConnections.js');
const Map = require('./models/Map.js');
const fs = require('fs');

/**
 * @param {String} orderBy SQL query to ORDER BY
 * @returns 
 */
const getMaps = async ( orderBy ) => {
    const VALID_QUERIES = new Set(["map_id", "map_id DESC", "map_name", "map_name DESC"]);
    if ( VALID_QUERIES.has( orderBy ) ) {
        return await database.query(`
            SELECT * FROM map
            ORDER BY ${orderBy}
            `, []).then( rows => {
                return rows.map( row => new Map( row ) );
        });
    } else {
        throw new Error("Input contained a restricted SQL query!");
    }
};

/**
 * @param {Number} map_id 
 * @returns 
 */
const getMapById = async ( map_id ) => {
    return await database.query(`
        SELECT * FROM map
        WHERE map_id = ?
        `, [map_id]).then( rows => {
            if ( rows.length === 1 ) {
                return new Map( rows[0] );
            }
            throw new Error("Map not found!");
    });
};

/**
 * @param {Map} map 
 * @returns 
 */
const createMap = async ( map ) => {
    return await database.query(`
        INSERT INTO map (map_id, map_scale, map_name, map_thumbnail, map_primary_color_R, map_primary_color_G, map_primary_color_B, map_is_custom)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, map.getAllVariables()).then( async rows => {
            if ( rows.affectedRows === 1 ) {
                return getMapById( map.map_id );
            }
            throw new Error("Map could not be created!");
    });
};

/**
 * @param {Map} map 
 * @returns 
 */
const updateMap = async ( map ) => {
    return await database.query(`
        UPDATE Map
        SET map_scale = ?, map_name = ?, map_thumbnail = ?, map_primary_color_R = ?, map_primary_color_G = ?, map_primary_color_B = ?, map_is_custom = ?
        WHERE map_id = ?
        `, [...map.getAllVariables().slice(1), map.map_id]).then( rows => {
            if ( rows.affectedRows === 1 ) {
                // const content = `INSERT INTO \`map\` (\`map_id\`, \`map_scale\`, \`map_name\`, \`map_thumbnail\`, \`map_primary_color\`, \`map_is_custom\`) VALUES (${map_id}, ${map_scale}, '${map_name}', '${map_thumbnail}', '${map_primary_color}', ${map_is_custom});\n`;
                // fs.appendFileSync(`./src/api/db/backend/test/04-Map-${map_name.split(' ').join('_')}.sql`, content);
                return getMapById( map.map_id );
            }
            throw new Error("Map could not be updated!");
    });
};

/**
 * @param {Number} map_id 
 * @returns 
 */
const deleteMap = async ( map_id ) => {
    await database.query(`
        DELETE FROM mapRegion
        WHERE mapRegion_map_id = ?
        `, [map_id])
        .then( rows => {
            return rows.affectedRows;
        });
    return await database.query(`
        DELETE FROM map
        WHERE map_id = ?
        `, [map_id])
        .then( rows => {
            return rows.affectedRows;
    });
};

module.exports = {
    getMaps,
    getMapById,
    createMap,
    updateMap,
    deleteMap
};