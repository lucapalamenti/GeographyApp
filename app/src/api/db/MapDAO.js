const database = require('./databaseConnections.js');
const util = require('../util/util.js');

const MMap = require('../models/MMap.js');

const FILENAME_PREFIX = "04-Map-";
const COPY_TO_FILE = false;

const VALID_SORT_QUERIES = new Set(["map_id", "map_id DESC", "map_name", "map_name DESC"]);

// ----- <<<<< GET/SELECT QUERIES >>>>> -----

/**
 * 
 * @param {"all" | "default" | "custom" | "template"} filter 
 * @param {"id" | "name"} sort
 * @param {"DESC"} DESC order results descending if present
 * @returns {Promise<Array<MMap>>}
 */
const getMaps = async ( filter, sort, DESC ) => {
    let query = "SELECT * FROM map\n";
    // Append filter clause
    switch ( filter ) {
        case "all":
            query = query.concat( "WHERE map_is_template = 0\n" );
            break;
        case "default":
            query = query.concat( "WHERE map_is_template = 0 AND map_is_custom = 0\n" );
            break;
        case "custom":
            query = query.concat( "WHERE map_is_template = 0 AND map_is_custom = 1\n" );
            break;
        case "template":
            query = query.concat( "WHERE map_is_template = 1\n" );
            break;
    }
    // Append sort clause
    switch ( sort ) {
        case "id":
        case "name":
            query = query.concat( "ORDER BY map_", sort, " " );
    }
    // Ascending or descending?
    if ( DESC === "DESC" ) query = query.concat( "DESC" );
    query = query.concat( ";" );
    console.log( query );
    return await database.query( query, []).then( rows => {
            return rows.map( row => new MMap( row ) );
    });
};

/**
 * @param {Number} map_id 
 * @returns {Promise<MMap>}
 */
const getMapById = async ( map_id ) => {
    if ( map_id ) {
        const rows = await database.query(`
            SELECT * FROM map
            WHERE map_id = ?;
        `, [map_id]);
        
        if ( rows.length === 1 ) {
            return new MMap( rows[0] );
        }
        throw new Error("Map not found!");
    }
    throw new Error("map_id cannot be null!");
};

// ----- <<<<< POST/INSERT QUERIES >>>>> -----

/**
 * @param {MMap} map 
 * @returns {Promise<MMap>}
 */
const createMap = async ( map ) => {
    const query = `
        INSERT INTO \`map\` (\`map_name\`, \`map_thumbnail\`, \`map_primary_color_R\`, \`map_primary_color_G\`, \`map_primary_color_B\`, \`map_is_template\`, \`map_is_custom\`)
        VALUES (?, ?, ?, ?, ?, ?, ?);
        `;
    const params = [...map.getAllVariables()];
    return await database.query( query, params ).then( async rows => {
            if ( rows.affectedRows === 1 ) {
                if ( COPY_TO_FILE ) {
                    util.copyQueryToFile( query, params, `${FILENAME_PREFIX}${map.map_name.split(' ').join('_')}` );
                }
                return getMapById( rows.insertId );
            }
            throw new Error("Map could not be created!");
    });
};

// ----- <<<<< PUT/UPDATE QUERIES >>>>> -----

/**
 * @param {MMap} map 
 * @returns {Promise<MMap>}
 */
const updateMap = async ( map ) => {
    const query = `
        UPDATE \`Map\`
        SET \`map_id\` = ?, \`map_name\` = ?, \`map_thumbnail\` = ?, \`map_primary_color_R\` = ?, \`map_primary_color_G\` = ?, \`map_primary_color_B\` = ?, \`map_is_template\` = ?, \`map_is_custom\` = ?
        WHERE \`map_id\` = ?;
        `;
    const params = [map.map_id, ...map.getAllVariables(), map.map_id];
    return await database.query( query, params ).then( rows => {
            if ( rows.affectedRows === 1 ) {
                if ( COPY_TO_FILE ) {
                    util.copyQueryToFile( query, params, `${FILENAME_PREFIX}${map.map_name.split(' ').join('_')}` );
                }
                return getMapById( map.map_id );
            }
            throw new Error("Map could not be updated!");
    });
};

// ----- <<<<< DELETE QUERIES >>>>> -----

/**
 * @param {Number} map_id 
 * @returns 
 */
const deleteMap = async ( map_id ) => {
    await database.query(`
        DELETE FROM mapRegion
        WHERE mapRegion_map_id = ?;
    `, [map_id]);

    return await database.query(`
        DELETE FROM map
        WHERE map_id = ?;
    `, [map_id]).affectedRows;
};

/**
 * Deletes all custom maps 
 * @returns {number} the number of custom maps that were deleted
 */
const deleteAllCustomMaps = async () => {
    await database.query(`
        DELETE mapRegion FROM mapRegion JOIN map
        ON mapRegion_map_id = map_id
        WHERE map_is_custom = 1;
    `, []);
    return await database.query(`
        DELETE FROM map
        WHERE map_is_custom = 1;
    `, []).affectedRows;
}

module.exports = {
    getMaps,
    getMapById,
    createMap,
    updateMap,
    deleteMap,
    deleteAllCustomMaps
};