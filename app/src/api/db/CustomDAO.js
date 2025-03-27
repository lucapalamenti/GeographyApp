const database = require('./databaseConnections.js');
const US_Counties_Parse = require('./backend/test/US_Counties-parse.js');
const US_States_Parse = require('./backend/test/US_States-Parse.js');
const US_States_Polygon_Parse = require('./backend/test/US_States_Polygon-parse.js');

const custom = async () => {
    await database.query(`
        DELETE FROM mapShape
        WHERE mapShape_map_id > 3
        `, []).then( rows => {
            return rows.affectedRows;
    });
    return await database.query(`
        DELETE FROM map
        WHERE map_id > 3
        `, []).then( rows => {
            return rows.affectedRows;
    });
};

const printShapeInsertQuery = () => {
    US_Counties_Parse.parse();
    return database.query(`SELECT * FROM shape WHERE shape_id = 1`);
};

module.exports = {
    custom,
    printShapeInsertQuery
};