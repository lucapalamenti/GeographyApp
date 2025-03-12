const database = require('./databaseConnections.js');
const US_Counties_Parse = require('./backend/test/US_Counties-parse.js');
const US_States_Parse = require('./backend/test/US_States-Parse.js');

const custom = async () => {
    return await database.query(`
        SELECT * FROM shape WHERE shape_map_id = 0;
        `, []).then( rows => {
        
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