const database = require('./databaseConnections.js');
const Map = require('./models/Map.js');

const getMaps = async () => {
    return await database.query(`
        SELECT * FROM map
        `, []).then( rows => {
        return rows.map( row => new Map( row ) );
    });
};

const getMapById = async ( map_id ) => {
    return await database.query(`SELECT * FROM map
        WHERE map_id = ?
        `, [map_id]).then( rows => {
        if ( rows.length === 1 ) {
            return new Map( rows[0] );
        }
        throw new Error('Map not found!');
    });
};

module.exports = {
    getMaps,
    getMapById
};