const database = require('./databaseConnections.js');
const Region = require('./models/Region.js');
// const fs = require('fs');

const getRegions = async () => {
    return await database.query(`
        SELECT * FROM region
        `, []).then( rows => {
            return rows.map( row => new Region( row ) );
    });
};

const getRegionById = async ( region_id ) => {
    return await database.query(`
        SELECT * FROM region
        WHERE region_id = ?
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
        WHERE mapRegion_map_id = ? AND mapRegion_parent = ? AND region_name = ?
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
        ORDER BY region_name
        `, [mapRegion_map_id]).then( rows => {
            return rows;
    });
};

const getRegionParentsForMap = async ( mapRegion_map_id ) => {
    return await database.query(`
        SELECT DISTINCT mapRegion_parent FROM mapRegion
        WHERE mapRegion_map_id = ?
        `, [mapRegion_map_id]).then( rows => {
            const parents = [];
            rows.forEach( row => {
                parents.push( row.mapRegion_parent );
            });
            return parents;
    });
};

const getMapRegion = async ( mapRegion_map_id, mapRegion_region_id ) => {
    return await database.query(`
        SELECT * FROM mapRegion
        WHERE mapRegion_map_id = ? AND mapRegion_region_id = ?
        `, [mapRegion_map_id, mapRegion_region_id]).then( rows => {
            if ( rows.length ) {
                return rows[0];
            } else {
                return {
                    mapregion_id : -1,
                    mapRegion_map_id : -1,
                    mapRegion_region_id : -1,
                    mapRegion_parent : '',
                    mapRegion_offsetX : 0,
                    mapRegion_offsetY : 0,
                    mapRegion_scaleX : 1,
                    mapRegion_scaleY : 1,
                };
            }
    });
};

const createRegion = async ( regionData ) => {
    const { region_name, region_points } = regionData;
    return await database.query(`
        INSERT INTO region (region_name, region_points)
        VALUES (?, ST_GEOMFROMTEXT(?))
        `, [region_name, region_points]).then( rows => {
            if ( rows.affectedRows === 1 ) {
                return getRegionById( rows.insertId );
            }
            throw new Error("Region could not be created!");
    });
};

const createMapRegion = async ( mapRegionData ) => {
    const { mapRegion_map_id, mapRegion_region_id, mapRegion_parent, mapRegion_offsetX, mapRegion_offsetY, mapRegion_scaleX, mapRegion_scaleY, mapRegion_state } = mapRegionData;
    return await database.query(`
        INSERT INTO mapRegion (mapRegion_map_id, mapRegion_region_id, mapRegion_parent, mapRegion_offsetX, mapRegion_offsetY, mapRegion_scaleX, mapRegion_scaleY, mapRegion_state)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [mapRegion_map_id, mapRegion_region_id, mapRegion_parent, mapRegion_offsetX, mapRegion_offsetY, mapRegion_scaleX, mapRegion_scaleY, mapRegion_state]).then( rows => {
            if ( rows.affectedRows === 1 ) {
                // const content2 = `INSERT INTO \`mapRegion\` (\`mapRegion_map_id\`, \`mapRegion_region_id\`, \`mapRegion_parent\`, \`mapRegion_offsetX\`, \`mapRegion_offsetY\`, \`mapRegion_scaleX\`, \`mapRegion_scaleY\`) VALUES (${mapRegion_map_id}, ${mapRegion_region_id}, "${mapRegion_parent}", ${mapRegion_offsetX.toFixed(6)}, ${mapRegion_offsetY.toFixed(6)}, ${mapRegion_scaleX.toFixed(6)}, ${mapRegion_scaleY.toFixed(6)});\n`;
                // fs.appendFileSync(`./src/api/db/backend/test/04-Map-${mapRegion_parent}_Counties.sql`, content2);
                return getRegionById( mapRegion_region_id );
            }
            throw new Error("mapRegion could not be created!");
    });
};

const deleteRegionsFromMap = async ( mapId ) => {
    return await database.query(`
        DELETE FROM region
        WHERE map_id = ?
        `, [mapId]).then( rows => {
            return rows.affectedRows;
    });
};

module.exports = {
    getRegions,
    getRegionById,
    getRegionByMapIdParentName,
    getRegionsByMapId,
    getMapRegion,
    getRegionParentsForMap,
    createRegion,
    createMapRegion,
    deleteRegionsFromMap
};