import HTTPClient from "./HTTPClient.js";

import MMap from "./models/MMap.js";
import MapRegion from "./models/MapRegion.js";
import Region from "./models/Region.js";
import Polygon from "./models/Polygon.js";
import { FrontendPayloadManager, PayloadChunk, SentinelChunk } from "./models/FrontendPayloadManager.js";

const BASE_API_PATH = "./api";

const handleAuthError = ( error ) => {
    // Unauthorized error
    if( error.status === 401 ) {
        document.location = "./login";
    }
    // Payload Too Large error
    if (error.status === 413 ) {
        
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
            if ( typeof payload == "object" ) payload = JSON.stringify( payload );
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

const getRegionParentsForMap = async ( mapRegion_map_id ) => {
    return await clientHandler( HTTPClient.get, `${BASE_API_PATH}/mapRegion/parents/${mapRegion_map_id}` );
};

const getMapRegion = async ( mapRegion_map_id, mapRegion_region_id ) => {
    return await clientHandler( HTTPClient.get, `${BASE_API_PATH}/mapRegion/${mapRegion_map_id}/${mapRegion_region_id}` );
};

/**
 * @param {Number} map_id 
 * @returns {Array<MapRegion>}
 */
const getRegionsByMapId = async ( map_id ) => {
    return await clientHandler( HTTPClient.get, `${BASE_API_PATH}/regions/map/${map_id}` );
};

const createRegion = async ( regionData ) => {
    return await clientHandler( HTTPClient.post, `${BASE_API_PATH}/regions`, regionData );
};

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

const getMaps = async ( where, orderBy ) => {
    return await clientHandler( HTTPClient.get, `${BASE_API_PATH}/maplist/where/${where}/orderBy/${orderBy}` );
};

const getMapById = async ( map_id ) => {
    return await clientHandler( HTTPClient.get, `${BASE_API_PATH}/maps/${map_id}` );
};

/**
 * Creates a Map in the database
 * @param {MMap} map 
 * @returns 
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

// ----- PolygonDAO CALLS -----

const getPolygonById = async ( polygon_id ) => {
    return await clientHandler( HTTPClient.get, `${BASE_API_PATH}/polygons/${polygon_id}` );
};

/**
 * 
 * @param {Number} region_id 
 * @returns {Array<Polygon>}
 */
const getPolygonsByRegionId = async ( region_id ) => {
    return await clientHandler( HTTPClient.get, `${BASE_API_PATH}/polygons/regionId/${region_id}` );
}

/**
 * @param {Polygon} polygon 
 */
const createPolygon = async ( polygon ) => {
    return await clientHandler( HTTPClient.post, `${BASE_API_PATH}/polygons`, polygon );
}

const deleteAllPolygons = async () => {
    return await clientHandler( HTTPClient.delete, `${BASE_API_PATH}/polygons` );
};

// ----- OTHER -----

const uploadFile = async ( data ) => {
    try {
        return await fetch(`${BASE_API_PATH}/uploadFile`, {
            method: 'POST',
            body: data
        });
    } catch (error) {
        return handleAuthError(error);
    }
};

const retrieveFile = async ( fileName ) => {
    try {
        return await HTTPClient.get(`/uploads/${fileName}`);
    } catch (error) {
        return handleAuthError(error);
    }
};

export default {
    custom,
    printRegionInsertQuery,
    
    getRegions,
    getRegionById,
    getRegionByMapIdParentName,
    getRegionsByMapId,
    getMapRegion,
    getRegionParentsForMap,
    createRegion,
    createMapRegion,
    getMapRegionStates,

    getMaps,
    getMapById,
    createMap,
    updateMap,
    deleteAllCustomMaps,
    deleteMap,

    getPolygonById,
    getPolygonsByRegionId,
    createPolygon,
    deleteAllPolygons,

    uploadFile,
    retrieveFile
}