import HTTPClient from './HTTPClient.js'

const BASE_API_PATH = './api';

const handleAuthError = ( error ) => {
    // Unauthorized error
    if( error.status === 401 ) {
        document.location = './login';
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

const printShapeInsertQuery = async () => {
    try {
        return await HTTPClient.post(`${BASE_API_PATH}/customPrint`);
    } catch (error) {
        return handleAuthError(error);
    }
}

// ----- ShapeDAO CALLS -----

const getShapes = async () => {
    try {
        return await HTTPClient.get(`${BASE_API_PATH}/shapes`);
    } catch (error) {
        return handleAuthError(error);
    }
};

const getShapeById = async ( shape_id ) => {
    try {
        return await HTTPClient.get(`${BASE_API_PATH}/shapes/${shape_id}`);
    } catch (error) {
        return handleAuthError(error);
    }
};

const getMapShape = async ( mapShape_map_id, mapShape_shape_id ) => {
    try {
        return await HTTPClient.get(`${BASE_API_PATH}/mapShape/${mapShape_map_id}/${mapShape_shape_id}`);
    } catch (error) {
        return handleAuthError(error);
    }
};

const createShape = async ( shapeData ) => {
    try {
        return await HTTPClient.post(`${BASE_API_PATH}/shapes`, shapeData);
    } catch (error) {
        return handleAuthError(error);
    }
};

const getShapesByMapId = async ( map_id ) => {
    try {
        return await HTTPClient.get(`${BASE_API_PATH}/shapes/map/${map_id}`);
    } catch (error) {
        return handleAuthError(error);
    }
};

const deleteShapesFromMap = async ( map_id ) => {
    try {
        return await HTTPClient.delete(`${BASE_API_PATH}/shapes/map/${map_id}`);
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

export default {
    custom,
    printShapeInsertQuery,
    
    getShapes,
    getShapeById,
    getMapShape,
    createShape,
    getShapesByMapId,
    deleteShapesFromMap,

    getMaps,
    getMapById
}