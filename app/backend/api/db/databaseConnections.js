const mariadb = require('mariadb');

/**
 * @type {import('mariadb').Pool}
 */
let pool;

const getDatabasePool = () => {
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

const getConnection = () => {
    return getDatabasePool().getConnection();
};

/**
 * 
 * @param {(...params) => Promise<>} method 
 * @param {...Array<*>} paramArrays
 */
const transaction = async ( method, ...paramArrays ) => {
    const connection = await getConnection();

    try {
        await connection.beginTransaction();
        for ( let i = 0; i < params[0].length; i++ ) {
            const params = paramArrays.map( arr => arr[i] );
            await method( connection, ...params );
        }
        await connection.commit();
    } catch ( err ) {
        await connection.rollback();
        throw err;
    }

    connection.release();
};

/**
 * Querys the database
 * @param {String} query An SQL query
 * @param {*} params 
 * @returns 
 */
const query = (query, params = []) => {
    const pool = getDatabasePool();
    return pool.query( query, params ).catch(err => {
        console.log( err );
        throw err; 
    });
};

const close = () => {
    if( pool ) {
        pool.end();
        pool = null;
    }
};

module.exports = {
    getDatabasePool,
    query,
    close
};