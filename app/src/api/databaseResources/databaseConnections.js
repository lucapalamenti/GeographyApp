const mariadb = require('mariadb');

let pool;

exports.getDatabaseConnection = () => {
    if ( !pool ) {
        pool = mariadb.createPool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            charset: process.env.DB_CHARSET
        });
    }
    return pool;
};

/**
 * Querys the database
 * @param {String} query An SQL query
 * @param {*} params 
 * @returns 
 */
exports.query = (query, params = []) => {
    const pool = exports.getDatabaseConnection();
    return pool.query(query, params).catch(err => {
        console.log( err );
        throw err; 
    });
};

exports.close = () => {
    if( pool ) {
        pool.end();
        pool = null;
    }
};