const database = require('./databaseConnections.js');
const Map = require('./models/Map.js');
// const fs = require('fs');

const getMaps = async ( ORDER_BY ) => {
    return await database.query(`
        SELECT * FROM map
        ORDER BY ${ORDER_BY}
        `, []).then( rows => {
            return rows.map( row => new Map( row ) );
    });
};

const getMapById = async ( map_id ) => {
    return await database.query(`
        SELECT * FROM map
        WHERE map_id = ?
        `, [map_id]).then( rows => {
            if ( rows.length === 1 ) {
                return new Map( rows[0] );
            }
            throw new Error('Map not found!');
    });
};

const createMap = async ( mapData ) => {
    const { map_id, map_scale, map_name, map_thumbnail, map_primary_color, map_is_custom } = mapData;
    return await database.query(`
        INSERT INTO map (map_id, map_scale, map_name, map_thumbnail, map_primary_color, map_is_custom)
        VALUES (?, ?, ?, ?, ?, ?)
        `, [map_id, map_scale, map_name, map_thumbnail, map_primary_color, map_is_custom]).then( rows => {
            if ( rows.affectedRows === 1 ) {
                return getMapById( map_id );
            }
            throw new Error('Map could not be created!');
    });
};

const updateMap = async ( mapData ) => {
    const { map_id, map_scale, map_name, map_thumbnail, map_primary_color, map_is_custom } = mapData;
    return await database.query(`
        UPDATE Map
        SET map_scale = ?, map_name = ?, map_thumbnail = ?, map_primary_color = ?, map_is_custom = ?
        WHERE map_id = ?
        `, [map_scale, map_name, map_thumbnail, map_primary_color, map_is_custom, map_id]).then( rows => {
            if ( rows.affectedRows === 1 ) {
                // const content = `INSERT INTO \`map\` (\`map_id\`, \`map_scale\`, \`map_name\`, \`map_thumbnail\`, \`map_primary_color\`, \`map_is_custom\`) VALUES (${map_id}, ${map_scale}, '${map_name}', '${map_thumbnail}', '${map_primary_color}', ${map_is_custom});\n`;
                // fs.appendFileSync(`./src/api/db/backend/test/04-Map-${map_name.split(' ').join('_')}.sql`, content);
                return getMapById( map_id );
            }
            throw new Error('Map could not be updated!');
    });
};

const deleteMap = async ( mapId ) => {
    await database.query(`
        DELETE FROM mapRegion
        WHERE mapRegion_map_id = ?
        `, [mapId])
        .then( rows => {
            return rows.affectedRows;
        });
    return await database.query(`
        DELETE FROM map
        WHERE map_id = ?
        `, [mapId])
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