import HTTPClient from "./HTTPClient.js";

import MMap from "./models/MMap.js";
import MapRegion from "./models/MapRegion.js";
import MapData from "./models/MapData.js"
import BackendMapRegion from "./models/BackendMapRegion.js"
import Region from "./models/Region.js";
import { FrontendPayloadManager, PayloadChunk, SentinelChunk } from "./models/FrontendPayloadManager.js";

const BASE_API_PATH = "./api";

const handleAuthError = ( error ) => {
    // Unauthorized error
    if( error.status === 401 ) {
        document.location = "./login";
    }
    // Payload Too Large error
    if (error.status === 413 ) {
        console.log({
            message: "Payload too large!!",
            error: error
        });
    }
    throw error;
};

/**
 * Handles calling HTTPClient. Catches errors
 * @param {Request} apiMethod 
 * @param {String} url 
 * @param {JSON} payload 
 * @returns {Promise}
 */
async function clientHandler( apiMethod, url, payload = null ) {
    try {
        // Chunkify ALL payloads, not just big ones
        if ( payload ) {
            // Make sure payload is a string
            if ( typeof payload !== "string" ) payload = JSON.stringify( payload );
            const groupId = FrontendPayloadManager.requestGroup();
            let chunkId = 0;
            /** @type {Array<Promise>} */
            let responses = [];
            // Max of 6 requests can be sent at once
            while ( payload.length > 0 ) {
                // Send each chunk as it's sliced from the payload
                responses[chunkId] = apiMethod( url, new PayloadChunk( chunkId, groupId, payload.slice( 0, FrontendPayloadManager.MAX_PAYLOAD_SIZE ) ) );
                payload = payload.slice( FrontendPayloadManager.MAX_PAYLOAD_SIZE );
                chunkId++;
            }
            // Let the backend know that we're done sending chunks
            responses.push( apiMethod( url, new SentinelChunk( groupId, chunkId ) ) );
            let resolves = await Promise.all( responses );
            FrontendPayloadManager.removeGroup( groupId );
            // Return the one chunk that isn't just the "Chunk received" message
            return resolves.find( e => e.message !== "Chunk received" );
        } else {
            return await apiMethod( url );
        }
    } catch ( error ) {
        return handleAuthError(error);
    }
}

async function compressAndSendPayload( url, payload ) {
    // 1. Convert the payload to a ReadableStream
    const stream = new Blob([JSON.stringify(payload)], { type: 'application/json' }).stream();
    // 2. Pipe the stream through a Gzip CompressionStream
    const compressedReadableStream = stream.pipeThrough( new CompressionStream( "gzip" ) );
    // 3. Convert the compressed stream back into a Blob or ArrayBuffer for sending
    const compressedBlob = await new Response(compressedReadableStream).blob();
    // 4. Send the compressed data with the 'Content-Encoding: gzip' header
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Or appropriate content type for your data
                'Content-Encoding': 'gzip'
            },
            body: compressedBlob
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Server response:', responseData);
    } catch (error) {
        console.error('Error sending compressed data:', error);
    }
}

// ----- CustomDAO CALLS -----

const custom = async () => {
    return await clientHandler( HTTPClient.get, `${BASE_API_PATH}/custom` );
};

const printRegionInsertQuery = async () => {
    return await clientHandler( HTTPClient.post, `${BASE_API_PATH}/customPrint` );
}

// ----- RegionDAO CALLS -----

/**
 * Returns all Region objects
 * @returns {Array<Region>}
 */
const getRegions = async () => {
    return await clientHandler( HTTPClient.get, `${BASE_API_PATH}/regions` );
};

/**
 * Returns a Region with the given region_id
 * @param {Number} region_id 
 * @returns {Region}
 */
const getRegionById = async ( region_id ) => {
    return await clientHandler( HTTPClient.get, `${BASE_API_PATH}/regions/${region_id}` );
};

const getRegionByMapIdParentName = async ( mapRegion_map_id, mapRegion_parent, region_name ) => {
    return await clientHandler( HTTPClient.get, `${BASE_API_PATH}/regions/${mapRegion_map_id}/${mapRegion_parent}/${region_name}` );
}

const getMapRegion = async ( mapRegion_map_id, mapRegion_region_id ) => {
    return await clientHandler( HTTPClient.get, `${BASE_API_PATH}/mapRegion/${mapRegion_map_id}/${mapRegion_region_id}` );
};

/**
 * @param {Number} map_id 
 * @returns {MapData}
 */
const getRegionsByMapId = async ( map_id ) => {
    return new MapData( await clientHandler( HTTPClient.get, `${BASE_API_PATH}/regions/map/${map_id}` ) );
};

const createRegion = async ( regionData ) => {
    return await clientHandler( HTTPClient.post, `${BASE_API_PATH}/regions`, regionData );
};

/**
 * Update the region_parent_id field for a range of Region objects 
 * with region_id's from startId to endId inclusive
 * @param {number} startId 
 * @param {number} endId 
 * @param {number} region_parent_id 
 * @returns {number} the number of affected Regions
 */
const setRegionParentId_range = async ( startId, endId, region_parent_id ) => {
    return await clientHandler( HTTPClient.put, `${BASE_API_PATH}/regions/setParent/${startId}/${endId}/${region_parent_id}` );
}

const createMapRegion = async ( mapRegionData ) => {
    return await clientHandler( HTTPClient.post, `${BASE_API_PATH}/mapRegion`, mapRegionData );
};

/**
 * Retrieves the enum values of mapRegion_state in an array of strings
 * @returns {Array<String>} 
 */
const getMapRegionStates = async () => {
    return await clientHandler( HTTPClient.get, `${BASE_API_PATH}/mapRegion/states` );
}

// ----- MapDAO CALLS -----

/**
 * 
 * @param {"all" | "default" | "custom" | "template"} filter 
 * @param {"id" | "name"} sort
 * @param {boolean} DESC order results asending if false, descending if true 
 * @returns {Array<MMap>}
 */
const getMaps = async ( filter, sort, DESC ) => {
    return await clientHandler( HTTPClient.get, `${BASE_API_PATH}/maps/type/${filter}/sort/${sort}/desc/${DESC}` );
};

/**
 * 
 * @param {Number} map_id 
 * @returns {Promise<MMap>}
 */
const getMapById = async ( map_id ) => {
    return await clientHandler( HTTPClient.get, `${BASE_API_PATH}/maps/${map_id}` );
};

/**
 * Creates a Map in the database
 * @param {MMap} map 
 * @returns {Promise<MMap>}
 */
const createMap = async ( map ) => {
    return await clientHandler( HTTPClient.post, `${BASE_API_PATH}/maps`, map );
};

/**
 * @param {MMap} map 
 * @returns 
 */
const updateMap = async ( map ) => {
    return await clientHandler( HTTPClient.put, `${BASE_API_PATH}/maps`, map );
};

/**
 * Deletes all custom maps
 * @returns 
 */
const deleteAllCustomMaps = async () => {
    return await clientHandler( HTTPClient.delete, `${BASE_API_PATH}/maps` );
};

/**
 * Deletes the map with the given map_id
 * @param {Number} map_id
 * @returns
 */
const deleteMap = async ( map_id ) => {
    return await clientHandler( HTTPClient.delete, `${BASE_API_PATH}/maps/${map_id}` );
};

// ----- OTHER -----

const uploadThumbnail = async ( data ) => {
    try {
        return await fetch(`${BASE_API_PATH}/upload/thumbnail`, {
            method: 'POST',
            body: new FormData( data )
        });
    } catch (error) {
        return handleAuthError(error);
    }
};

const processMapfile = async ( data ) => {
    try {
        return await fetch(`${BASE_API_PATH}/upload/mapfile/process`, {
            method: 'POST',
            body: new FormData( data )
        });
    } catch (error) {
        return handleAuthError(error);
    }
};

const createTemplateMap = async ( data ) => {
    return await clientHandler( HTTPClient.post, `${BASE_API_PATH}/upload/mapfile/create`, data );
};

export default {
    custom,
    printRegionInsertQuery,
    
    getRegions,
    getRegionById,
    getRegionByMapIdParentName,
    getRegionsByMapId,
    getMapRegion,
    createRegion,
    setRegionParentId_range,
    createMapRegion,
    getMapRegionStates,

    getMaps,
    getMapById,
    createMap,
    updateMap,
    deleteAllCustomMaps,
    deleteMap,

    uploadThumbnail,
    processMapfile,
    createTemplateMap
}