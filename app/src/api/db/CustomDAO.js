const database = require('./databaseConnections.js');
const fs = require('fs');

const custom = () => {
    return database.query(`
        INSERT INTO shape (shape_map_id, shape_name, shape_points)
        VALUES (?, ?, ST_GEOMFROMTEXT(?))
        `, [1, 'hi', 'MULTIPOLYGON(((58 26,227 26,230 146,37 136,17 47,58 26)))']).then( rows => {
        return rows.affectedRows;
    });
};

const printShapesToFile = ( valuesString ) => {
    const { string } = valuesString;
    const content = `INSERT INTO \`shape\` (\`shape_id\`, \`shape_map_id\`, \`shape_name\`, \`shape_points\`) VALUES (${string});\n`;
    console.log( content );
    fs.appendFileSync('./src/api/db/usableQueries.txt', content);
    return database.query(`SELECT * FROM shape WHERE shape_map_id = 0`);
}

module.exports = {
    custom,
    printShapesToFile
};