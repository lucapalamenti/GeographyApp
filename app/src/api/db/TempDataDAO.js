const Crypto = require('crypto');

const database = require('./databaseConnections.js');

const MAX_STRING_SIZE = 1_000_000;

/**
 * Deletes the current tempData if there is one, and creates a new row
 * for the given data
 * @param {Object} tempData_data 
 */
const createTempData = async ( tempData_data ) => {
    await database.query(`
        DELETE FROM tempData;
        `, []);

    let string = JSON.stringify( tempData_data );
    let id = 1;
    while ( string.length > 0 ) {
        await database.query(`
            INSERT INTO tempData (tempData_id, tempData_data)
            VALUES (?, ?);
            `, [id, string.slice( 0, MAX_STRING_SIZE )]);
        string = string.slice( MAX_STRING_SIZE );
        id++;
    }
};

/**
 * Retrieves tempData_data from the database, and deletes all existing rows because
 * we dont need it anymore
 * @returns {Object}
 */
const extractTempData = async () => {
    const tempData_data_rows = await database.query(`
        SELECT * FROM tempData;
        `, []).then( rows => {
            return rows.map( row => row.tempData_data );
        });
    await database.query(`
        DELETE FROM tempData;
        `, []);
    return JSON.parse( tempData_data_rows.join( "" ) );
};

module.exports = {
    createTempData,
    extractTempData
};