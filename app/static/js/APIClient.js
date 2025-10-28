import HTTPClient from "./HTTPClient.js";

import MMap from "./models/MMap.js";
import MapRegion from "./models/MapRegion.js";
import Region from "./models/Region.js";
import Polygon from "./models/Polygon.js";

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
 * @param {CallableFunction} apiMethod 
 * @param {String} url 
 * @param {Object} payload 
 * @returns {Promise}
 */
const clientHandler = async ( apiMethod, url, payload ) => {
    try {
        return await apiMethod(url, payload);
    } catch (error) {
        return handleAuthError(error);
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
    return await clientHandler( HTTPClient.get, `${BASE_API_PATH}/regions/${mapRegion_map_id}/${mapRegion_parent}/${region_name.split('-').join('%2D')}` );
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

/**
 * 
 * @param {Polygon} polygon 
 */
const createPolygon = async ( polygon ) => {
    console.log( JSON.stringify(polygon).length );
    return await clientHandler( HTTPClient.post, `${BASE_API_PATH}/polygons`, polygon );
}

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

    createPolygon,

    uploadFile,
    retrieveFile
}