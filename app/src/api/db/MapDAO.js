const database = require('./databaseConnections.js');
const util = require('./backend/util.js');

const MMap = require('./models/MMap.js');

const FILENAME_PREFIX = "04-Map-";
const COPY_TO_FILE = false;

/**
 * SQL injection is possible
 * @param {String} where SQL query to SELECT * WHERE
 * @param {String} orderBy SQL query to ORDER BY
 * @returns {Promise<Array<MMap>>}
 */
const getMaps = async ( where, orderBy ) => {
    const VALID_QUERIES = new Set(["map_id", "map_id DESC", "map_name", "map_name DESC"]);
    if ( VALID_QUERIES.has( orderBy ) ) {
        return await database.query(`
            SELECT * FROM map
            WHERE ${where}
            ORDER BY ${orderBy};
            `, []).then( rows => {
                return rows.map( row => new MMap( row ) );
        });
    } else {
        throw new Error("Input contained a restricted SQL query!");
    }
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

/**
 * @param {MMap} map 
 * @returns {Promise<MMap>}
 */
const createMap = async ( map ) => {
    const query = `
        INSERT INTO \`map\` (\`map_name\`, \`map_thumbnail\`, \`map_primary_color_R\`, \`map_primary_color_G\`, \`map_primary_color_B\`, \`map_is_custom\`)
        VALUES (?, ?, ?, ?, ?, ?);
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

/**
 * @param {MMap} map 
 * @returns {Promise<MMap>}
 */
const updateMap = async ( map ) => {
    const query = `
        UPDATE \`Map\`
        SET \`map_id\` = ?, \`map_name\` = ?, \`map_thumbnail\` = ?, \`map_primary_color_R\` = ?, \`map_primary_color_G\` = ?, \`map_primary_color_B\` = ?, \`map_is_custom\` = ?
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