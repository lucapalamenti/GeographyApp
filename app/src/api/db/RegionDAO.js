const database = require('./databaseConnections.js');
const MapDAO = require('./MapDAO.js');
const util = require('../util/util.js');

const BackendMapRegion = require('../models/BackendMapRegion.js');
const FrontendMapRegion = require('../models/FrontendMapRegion.js');
const Region = require('../models/Region.js');

const FILENAME_PREFIX = "04-Map-";
const COPY_TO_FILE = false;

// ----- <<<<< SELECT STATEMENTS >>>>> -----

/**
 * Gets all Region objects from the database
 * @returns {Promise<Array<Region>>}
 */
const getRegions = async () => {
    return await database.query(`
        SELECT * FROM region;
        `, [])
        .then( rows => {
            return rows.map( row => new Region( row ) );
    });
};

/**
 * 
 * @param {Number} region_id 
 * @returns {Promise<Region>}
 */
const getRegionById = async ( region_id ) => {
    return await database.query(`
        SELECT * FROM region
        WHERE region_id = ?;
        `, [region_id])
        .then( rows => {
            if ( rows.length === 1 ) {
                return new Region( rows[0] );
            }
            throw new Error("Region not found!");
    });
};

/**
 * 
 * @param {*} regionData 
 * @returns {Promise<BackendMapRegion>}
 */
const getRegionByMapIdParentName = async ( regionData ) => {
    const { mapRegion_map_id, mapRegion_parent, region_name } = regionData;
    return await database.query(`
        SELECT * FROM mapRegion JOIN region
        ON mapRegion_region_id = region_id
        WHERE mapRegion_map_id = ? AND mapRegion_parent = ? AND region_name = ?;
        `, [mapRegion_map_id, mapRegion_parent, region_name]).then( rows => {
            if ( rows.length === 1 ) {
                return rows[0];
            }
            throw new Error("Region not found!");
    });
};

/**
 * 
 * @param {number} mapRegion_map_id 
 * @returns {Promise<Array<BackendMapRegion>>}
 */
const getRegionsByMapId = async ( mapRegion_map_id ) => {
    return await database.query(`
        SELECT * FROM mapRegion
        JOIN region ON mapRegion_region_id = region_id
        WHERE mapRegion_map_id = ?
        ORDER BY region_name;
        `, [mapRegion_map_id]).then( rows => {
            return rows.map( row => {
                return new BackendMapRegion( row );
            });
    });
};

/**
 * 
 * @param {number} mapRegion_map_id 
 * @returns {Promise<Array<string>>}
 */
const getRegionParentsForMap = async ( mapRegion_map_id ) => {
    return await database.query(`
        SELECT DISTINCT mapRegion_parent FROM mapRegion
        WHERE mapRegion_map_id = ?;
        `, [mapRegion_map_id]).then( rows => {
            const parents = [];
            rows.forEach( row => {
                parents.push( row.mapRegion_parent );
            });
            return parents;
    });
};

/**
 * 
 * @param {Region} region 
 * @returns {Promise<Region>}
 */
const createRegion = async ( region ) => {
    const { region_name, region_type, region_parent_id, region_points } = region;
    const query = `
        INSERT INTO region (region_name, region_type, region_parent_id, region_points)
        VALUES (?, ?, ?, ST_GEOMFROMTEXT(?));
        `;
    const params = [region_name, region_type, region_parent_id, region_points.toQueryString()];
    return await database.query( query, params ).then( rows => {
        if ( rows.affectedRows === 1 ) {
            return getRegionById( rows.insertId );
        }
        throw new Error("Region could not be created!");
    });
};

/**
 * Deletes the region with the given region_id
 * @param {number} region_id 
 * @returns {Promise<>}
 */
const deleteRegion = async ( region_id ) => {
    return await database.query(`
        DELETE FROM region
        WHERE region_id = ?;
        `, [region_id]).catch( err => {
            throw new Error("Region could not be deleted!");
        });
};

/**
 * Returns a MapRegion given its ID
 * @param {Number} mapRegion_id 
 * @returns {Promise<FrontendMapRegion>}
 */
const getMapRegionById = async ( mapRegion_id ) => {
    return await database.query(`
        SELECT * FROM mapRegion
        WHERE mapRegion_id = ?;
        `, [mapRegion_id]).then( rows => {
            if ( rows.length === 1 ) {
                return new FrontendMapRegion( rows[0] );
            }
            throw new Error("MapRegion not found!");
        });
}

const getMapRegion = async ( mapRegion_map_id, mapRegion_region_id ) => {
    return await database.query(`
        SELECT * FROM mapRegion
        WHERE mapRegion_map_id = ? AND mapRegion_region_id = ?;
        `, [mapRegion_map_id, mapRegion_region_id]).then( rows => {
            if ( rows.length ) {
                return new BackendMapRegion( rows[0] );
            }
            throw new Error("MapRegion not found!");
        });
};

/**
 * 
 * @param {Number} mapRegion_region_id 
 * @returns {Promise<String>}
 */
const getMapRegionParent = async ( mapRegion_region_id ) => {
    return await database.query(`
        SELECT * FROM mapRegion
        WHERE mapRegion_region_id = ?;
        `, [mapRegion_region_id]).then( rows => {
            if ( rows.length ) {
                return new BackendMapRegion( rows[0] ).mapRegion_parent;
            }
            throw new Error("MapRegion not found!");
        });
};

/**
 * @param {FrontendMapRegion} mapRegion
 * @returns {Promise<BackendMapRegion>}
 */
const createMapRegion = async ( mapRegion ) => {
    let query = "", params = [];
    if ( mapRegion.mapRegion_parent ) {
        query = `
            INSERT INTO mapRegion (mapRegion_map_id, mapRegion_region_id, mapRegion_parent, mapRegion_type)
            VALUES (?, ?, ?, ?);
            `;
        params = [...mapRegion.getAllVariables()];
    } else {
        query = `
            INSERT INTO mapRegion (mapRegion_map_id, mapRegion_region_id, mapRegion_type)
            VALUES (?, ?, ?);
            `;
        params = [...mapRegion.getVariablesNoParent()];
    }
    return await database.query( query, params ).then( async rows => {
            if ( rows.affectedRows === 1 ) {
                if ( COPY_TO_FILE ) {
                    const map = await MapDAO.getMapById( mapRegion.mapRegion_map_id );
                    util.copyQueryToFile( query, params, `${FILENAME_PREFIX}${map.map_name.split(' ').join('_')}` );
                }
                return await getMapRegionById( rows.insertId );
            }
            throw new Error("mapRegion could not be created!");
        });
};

/**
 * 
 * @returns {Promise<Array<String>>}
 */
const getMapRegionStates = async () => {
    return await database.query(`
        SELECT COLUMN_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'geographyapp'
            AND TABLE_NAME = 'mapRegion'
            AND COLUMN_NAME = 'mapRegion_type';
        `, []).then( rows => {
            // Looks like "enum('disabled','enabled')"
            const str = rows[0].COLUMN_TYPE;
            return str.substring(6, str.length - 2).split("','");
        });
};

module.exports = {
    getRegions,
    getRegionById,
    getRegionByMapIdParentName,
    getRegionsByMapId,
    getMapRegion,
    getRegionParentsForMap,
    getMapRegionParent,
    createRegion,
    deleteRegion,
    createMapRegion,
    getMapRegionStates
};