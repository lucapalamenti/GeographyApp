import HTTPClient from "./HTTPClient.js";

const BASE_API_PATH = "./api";

const handleAuthError = ( error ) => {
    // Unauthorized error
    if( error.status === 401 ) {
        document.location = "./login";
    }
    throw error;
};

// ----- CustomDAO CALLS -----

const custom = async () => {
    try {
        return await HTTPClient.get(`${BASE_API_PATH}/custom`);
    } catch (error) {
        return handleAuthError(error);
    }
};

const printRegionInsertQuery = async () => {
    try {
        return await HTTPClient.post(`${BASE_API_PATH}/customPrint`);
    } catch (error) {
        return handleAuthError(error);
    }
}

// ----- RegionDAO CALLS -----

const getRegions = async () => {
    try {
        return await HTTPClient.get(`${BASE_API_PATH}/regions`);
    } catch (error) {
        return handleAuthError(error);
    }
};

const getRegionById = async ( region_id ) => {
    try {
        return await HTTPClient.get(`${BASE_API_PATH}/regions/${region_id}`);
    } catch (error) {
        return handleAuthError(error);
    }
};

const getRegionByMapIdParentName = async ( mapRegion_map_id, mapRegion_parent, region_name ) => {
    try {
        return await HTTPClient.get(`${BASE_API_PATH}/regions/${mapRegion_map_id}/${mapRegion_parent}/${region_name.split('-').join('%2D')}`);
    } catch (error) {
        return handleAuthError(error);
    }
}

const getRegionParentsForMap = async ( mapRegion_map_id ) => {
    try {
        return await HTTPClient.get(`${BASE_API_PATH}/mapRegion/parents/${mapRegion_map_id}`);
    } catch (error) {
        return handleAuthError(error);
    }
};

const getMapRegion = async ( mapRegion_map_id, mapRegion_region_id ) => {
    try {
        return await HTTPClient.get(`${BASE_API_PATH}/mapRegion/${mapRegion_map_id}/${mapRegion_region_id}`);
    } catch (error) {
        return handleAuthError(error);
    }
};

const getRegionsByMapId = async ( map_id ) => {
    try {
        return await HTTPClient.get(`${BASE_API_PATH}/regions/map/${map_id}`);
    } catch (error) {
        return handleAuthError(error);
    }
};

const createRegion = async ( regionData ) => {
    try {
        return await HTTPClient.post(`${BASE_API_PATH}/regions`, regionData);
    } catch (error) {
        return handleAuthError(error);
    }
};

const createMapRegion = async ( mapRegionData ) => {
    try {
        return await HTTPClient.post(`${BASE_API_PATH}/mapRegion`, mapRegionData);
    } catch (error) {
        return handleAuthError(error);
    }
};

const deleteRegionsFromMap = async ( map_id ) => {
    try {
        return await HTTPClient.delete(`${BASE_API_PATH}/regions/map/${map_id}`);
    } catch (error) {
        return handleAuthError(error);
    }
};

// ----- MapDAO CALLS -----

const getMaps = async ( ORDER_BY ) => {
    try {
        return await HTTPClient.get(`${BASE_API_PATH}/maplist/${ORDER_BY}`);
    } catch (error) {
        return handleAuthError(error);
    }
};

const getMapById = async ( map_id ) => {
    try {
        return await HTTPClient.get(`${BASE_API_PATH}/maps/${map_id}`);
    } catch (error) {
        return handleAuthError(error);
    }
};

const createMap = async ( mapData ) => {
    try {
        return await HTTPClient.post(`${BASE_API_PATH}/maps`, mapData);
    } catch (error) {
        return handleAuthError(error);
    }
};

const updateMap = async ( mapData ) => {
    try {
        return await HTTPClient.put(`${BASE_API_PATH}/maps`, mapData);
    } catch (error) {
        return handleAuthError(error);
    }
};

const deleteMap = async ( map_id ) => {
    try {
        return await HTTPClient.delete(`${BASE_API_PATH}/maps/${map_id}`);
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
    deleteRegionsFromMap,

    getMaps,
    getMapById,
    createMap,
    updateMap,
    deleteMap
}