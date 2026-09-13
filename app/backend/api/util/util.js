import { appendFileSync } from 'fs';
import { unlink, readdir } from 'fs/promises';
import { join } from 'path';

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
            params[n] = `"${params[n]}"`;
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
    appendFileSync(`./backend/api/db/backend/test/queries/${fileName}.sql`, build.trim().concat('\n') );
}

/**
 * Delete a file from a directory
 * @param {string} directory 
 * @param {string} filename 
 */
async function deleteFileFromDirectory( directory, filename ) {
    try {
        unlink( join( directory, filename ) );
    } catch ( err ) {
        console.error( `Error deleting file ${filename} in directory ${directory}`, err );
    }
}

/**
 * Deletes all files in the given directory
 * @param {string} directory 
 */
async function deleteAllFilesInDirectory( directory ) {
    try {
        const files = await readdir( directory );
        // Asynchronously delete each file
        if ( files.length !== 0 ) {
            // Wait for all promises to complete
            await Promise.all( files.forEach( file => {
                return unlink( join( directory, file ) );
            }));
        }
    } catch ( err ) {
        console.error( `Error deleting all files in ${directory}` );
    }
}

export default {
    copyQueryToFile,
    deleteFileFromDirectory,
    deleteAllFilesInDirectory
};