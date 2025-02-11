const database = require('./databaseConnections.js');

const custom = () => {
    return database.query(`
        INSERT INTO shape (shape_map_id, shape_name, shape_points)
        VALUES (?, ?, ST_GEOMFROMTEXT(?))
        `, [1, 'hi', 'MULTIPOLYGON(((58 26,227 26,230 146,37 136,17 47,58 26)))']).then( rows => {
        return rows.affectedRows;
    });
};

module.exports = {
    custom
};