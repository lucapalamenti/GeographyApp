const database = require('./databaseConnections.js');
const MapDAO = require('./MapDAO.js');
const util = require('./backend/util.js');

const MapRegion = require('./models/MapRegion.js');
const Region = require('./models/Region.js');

const FILENAME_PREFIX = "04-Map-";
const COPY_TO_FILE = true;

const getRegions = async () => {
    return await database.query(`
        SELECT * FROM region;
        `, []).then( rows => {
            return rows.map( row => new Region( row ) );
    });
};

const getRegionById = async ( region_id ) => {
    return await database.query(`
        SELECT * FROM region
        WHERE region_id = ?;
        `, [region_id]).then( rows => {
            if ( rows.length === 1 ) {
                return new Region( rows[0] );
            }
            throw new Error("Region not found!");
    });
};

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

const getRegionsByMapId = async ( mapRegion_map_id ) => {
    return await database.query(`
        SELECT * FROM mapRegion JOIN region
        ON mapRegion_region_id = region_id
        WHERE mapRegion_map_id = ?
        ORDER BY region_name;
        `, [mapRegion_map_id]).then( rows => {
            return rows;
    });
};

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

const createRegion = async ( regionData ) => {
    const { region_name, region_points } = regionData;
    return await database.query(`
        INSERT INTO region (region_name, region_points)
        VALUES (?, ST_GEOMFROMTEXT(?));
        `, [region_name, region_points]).then( rows => {
            if ( rows.affectedRows === 1 ) {
                return getRegionById( rows.insertId );
            }
            throw new Error("Region could not be created!");
    });
};

/**
 * Returns a MapRegion given its ID
 * @param {Number} mapRegion_id 
 * @returns {MapRegion}
 */
const getMapRegionById = async ( mapRegion_id ) => {
    return await database.query(`
        SELECT * FROM mapRegion
        WHERE mapRegion_id = ?;
        `, [mapRegion_id]).then( rows => {
            if ( rows.length === 1 ) {
                return new MapRegion( rows[0] );
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
                return new MapRegion( rows[0] );
            }
            throw new Error("MapRegion not found!");
    });
};

/**
 * @param {MapRegion} mapRegion
 * @returns {MapRegion}
 */
const createMapRegion = async ( mapRegion ) => {
    const query = `
        INSERT INTO \`mapRegion\` (\`mapRegion_map_id\`, \`mapRegion_region_id\`, \`mapRegion_parent\`, \`mapRegion_offsetX\`, \`mapRegion_offsetY\`, \`mapRegion_scaleX\`, \`mapRegion_scaleY\`, \`mapRegion_type\`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;
    const params = [...mapRegion.getAllVariables()];
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

const getStates = async () => {
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
}

module.exports = {
    getRegions,
    getRegionById,
    getRegionByMapIdParentName,
    getRegionsByMapId,
    getMapRegion,
    getRegionParentsForMap,
    createRegion,
    createMapRegion,
    getStates
};