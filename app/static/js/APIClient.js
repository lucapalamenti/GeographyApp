import HTTPClient from './HTTPClient.js'

const BASE_API_PATH = './api';

const handleAuthError = ( error ) => {
    // Unauthorized error
    if( error.status === 401 ) {
        document.location = './login';
    }
    throw error;
};

const getShapes = async () => {
    try {
        return await HTTPClient.get(`${BASE_API_PATH}/shapes`);
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

const updatePoints = async ( shapeData ) => {
    try {
        return await HTTPClient.put(`${BASE_API_PATH}/shapes`, shapeData);
    } catch (error) {
        return handleAuthError(error);
    }
};

const appendPoints = async ( appendData ) => {
    try {
        return await HTTPClient.put(`${BASE_API_PATH}/shapes/points`, appendData);
    } catch (error) {
        return handleAuthError(error);
    }
};

export default {
    getShapes,
    createShape,
    updatePoints,
    appendPoints
}