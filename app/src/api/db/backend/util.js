const fs = require('fs');

/**
 * Writes an SQL query to a file in the backend.
 * mainly used for creating maps that are intended to be default data.
 * 
 * @param {String} query
 * @param {Array<>} params
 * @param {String} fileName
 */
function copyQueryToFile( query, params, fileName ) {
    const arr = query.split('?');
    let build = arr[0];
    for ( let n = 0; n < arr.length - 1; n++ ) {
        // If the param is a string, we need to add \` before and after it
        if ( typeof params[n] === "string" ) {
            params[n] = `\`${params[n]}\``;
        }
        build = build.concat( params[n], arr[n + 1] );
    }
    // If there is a page break
    if ( build.includes('\n') ) {
        // Remove page break and trim whitespace
        build = build.split('\n');
        for ( let i = 0; i < build.length; i++ ) {
            build[i] = build[i].trim();
        }
        build = build.join(' ');
    }
    fs.appendFileSync(`./src/api/db/backend/test/queries/${fileName}.sql`, build.trim().concat('\n') );
}

module.exports = {
    copyQueryToFile
};