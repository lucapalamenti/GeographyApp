const database = require('./databaseConnections.js');
const US_Counties_Parse = require('./backend/test/US_Counties-parse.js');
const US_States_Parse = require('./backend/test/US_States-Parse.js');

const custom = async () => {
    return await database.query(`
        INSERT INTO shape (shape_map_id, shape_name, shape_points)
        VALUES (?, ?, ST_GEOMFROMTEXT(?))
        `, [1, 'hi', 'POLYGON((58 26,227 26,230 146,37 136,17 47,58 26))']).then( rows => {
        return rows.affectedRows;
    });
};

const printShapeInsertQuery = () => {
    // US_Counties_Parse.parse();
    return database.query(`SELECT * FROM shape WHERE shape_map_id = 0`);
};

module.exports = {
    custom,
    printShapeInsertQuery
};