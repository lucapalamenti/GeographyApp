import DBC from './databaseConnections.js';
import util from '../util/util.js';

import Region from '../models/Region.js';
import MapRegion from '../models/MapRegion.js';

const FILENAME_PREFIX = "04-Map-";
const COPY_TO_FILE = false;

// ----- <<<<< SELECT STATEMENTS >>>>> -----

/**
 * Gets all Region objects from the database
 * @returns {Promise<Array<Region>>}
 */
export const getRegions = async () => {
    return await DBC.query(`
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
export const getRegionById = async ( region_id ) => {
    return await DBC.query(`
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
 * @param {number} mapRegion_map_id 
 * @returns {Promise<Array<MapRegion>>}
 */
export const getRegionsByMapId = async ( mapRegion_map_id ) => {
    return await DBC.query(`
        SELECT * FROM mapRegion
        JOIN region ON mapRegion_region_id = region_id
        WHERE mapRegion_map_id = ?
        ORDER BY region_name;
        `, [mapRegion_map_id]).then( rows => {
            return rows.map( row => new MapRegion( row ) );
    });
};

/**
 * 
 * @param {number} map_id 
 * @returns {Promise<Array<string>>}
 */
export const getParentRegionsByMapId = async ( map_id ) => {
    const query = `
        SELECT DISTINCT
            parent.region_id,
            parent.region_name,
            parent.region_type,
            parent.region_parent_id,
            parent.region_template_id,
            parent.region_points
        FROM region AS child
            JOIN mapRegion
                ON child.region_id = mapRegion.mapRegion_region_id
            JOIN region AS parent
                ON parent.region_id = child.region_parent_id
        WHERE mapRegion.mapRegion_map_id = ?;
        `;
    const params = [map_id];
    return await DBC.query( query, params ).then( rows => {
        console.log( rows );
        return rows;
    });
}

// ----- <<<<< INSERT STATEMENTS >>>>> -----

/**
 * 
 * @param {Region} region 
 * @returns {Promise<Region>}
 */
export const createRegion = async ( region ) => {
    const { region_name, region_type, region_parent_id, region_template_id, region_points } = region;
    const query = `
        INSERT INTO region (region_name, region_type, region_parent_id, region_template_id, region_points)
        VALUES (?, ?, ?, ?, ST_GEOMFROMTEXT(?));
        `;
    const params = [region_name, region_type, region_parent_id, region_template_id, region_points.toQueryString()];
    return await DBC.query( query, params ).then( rows => {
        if ( rows.affectedRows === 1 ) {
            return getRegionById( rows.insertId );
        }
        throw new Error("Region could not be created!");
    });
};

/**
 * Update the region_parent_id field for a range of Region objects 
 * with region_id's from startId to endId inclusive
 * @param {number} startId 
 * @param {number} endId 
 * @param {number} region_parent_id
 * @returns {Promise<number>} the number of affected Regions
 */
export const setRegionParentId_range = async ( startId, endId, region_parent_id ) => {
    if ( isNaN( startId ) ) startId = 0;
    if ( isNaN( endId ) ) endId = Number.MAX_SAFE_INTEGER;
    try {
        await getRegionById( region_parent_id );
        const query = `
            UPDATE region
            SET region_parent_id = ?
            WHERE region_id BETWEEN ? AND ?;
        `;
        const params = [region_parent_id, startId, endId];
        return await DBC.query( query, params ).then( rows => {
            return rows.affectedRows;
        });
    } catch ( err ) {
        return { error : err };
    }
};

/**
 * Deletes the region with the given region_id
 * @param {number} region_id 
 * @returns {Promise<>}
 */
export const deleteRegion = async ( region_id ) => {
    return await DBC.query(`
        DELETE FROM region
        WHERE region_id = ?;
        `, [region_id]).catch( err => {
            throw new Error("Region could not be deleted!");
        });
};

/**
 * Deletes all Regions with region_id between startId and endId
 * @param {number} startId 
 * @param {number} endId 
 * @returns {Promise<>}
 */
export const deleteRegion_range = async ( startId, endId ) => {
    if ( isNaN( startId ) ) startId = 0;
    if ( isNaN( endId ) ) endId = Number.MAX_SAFE_INTEGER;
    await deleteMapRegion_range( startId, endId );
    return await DBC.query(`
        DELETE FROM region
        WHERE region_id BETWEEN ? AND ?;
        `, [startId, endId]).catch( err => {
            throw new Error("Regions could not be deleted!");
        });
};

export const deleteMapRegion_range = async ( startId, endId ) => {
    if ( isNaN( startId ) ) startId = 0;
    if ( isNaN( endId ) ) endId = Number.MAX_SAFE_INTEGER;
    return await DBC.query(`
        DELETE FROM mapRegion
        WHERE mapRegion_region_id BETWEEN ? AND ?;
        `, [startId, endId]).catch( err => {
            throw new Error("Regions could not be deleted!");
        });
};

export const getMapRegion = async ( mapRegion_map_id, mapRegion_region_id ) => {
    return await DBC.query(`
        SELECT * FROM mapRegion
        WHERE mapRegion_map_id = ? AND mapRegion_region_id = ?;
        `, [mapRegion_map_id, mapRegion_region_id]).then( rows => {
            if ( rows.length ) {
                return new MapRegion( rows[0] );
            }
            throw new Error("MapRegion not found!");
        });
};

/**
 * @param {MapRegionJoinData} mapRegion
 * @returns {Promise<number>}
 */
export const createMapRegion = async ( mapRegion ) => {
    const query = `
        INSERT INTO mapRegion (mapRegion_map_id, mapRegion_region_id, mapRegion_type)
        VALUES (?, ?, ?);
        `;
    const params = [mapRegion.mapRegion_map_id, mapRegion.mapRegion_region_id, mapRegion.mapRegion_type];
    return await DBC.query( query, params ).then( async rows => {
            if ( rows.affectedRows === 1 ) {
                if ( COPY_TO_FILE ) {
                    const map = await getMapById( mapRegion.mapRegion_map_id );
                    util.copyQueryToFile( query, params, `${FILENAME_PREFIX}${map.map_name.split(' ').join('_')}` );
                }
                return Number( rows.insertId );
            }
            throw new Error("mapRegion could not be created!");
        });
};

/**
 * 
 * @returns {Promise<Array<String>>}
 */
export const getMapRegionStates = async () => {
    return await DBC.query(`
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