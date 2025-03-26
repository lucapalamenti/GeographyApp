const database = require('./databaseConnections.js');
const Map = require('./models/Map.js');

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
    const { map_id, map_scale, map_name, map_thumbnail, map_primary_color } = mapData;
    return await database.query(`
        INSERT INTO map (map_id, map_scale, map_name, map_thumbnail, map_primary_color)
        VALUES (?, ?, ?, ?, ?)
        `, [map_id, map_scale, map_name, map_thumbnail, map_primary_color]).then( rows => {
        if ( rows.affectedRows === 1 ) {
            return getMapById( map_id );
        }
        throw new Error('Map could not be created!');
    });
}

module.exports = {
    getMaps,
    getMapById,
    createMap
};