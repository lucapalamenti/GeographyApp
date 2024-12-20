import HTTPClient from './HTTPClient.js'

const BASE_API_PATH = './api';

const handleAuthError = ( error ) => {
    // Unauthorized error
    if( error.status === 401 ) {
        document.location = './login';
    }
    throw error;
};

const getShapes = () => {
    return HTTPClient.get(`${BASE_API_PATH}/shapes`)
        .catch(handleAuthError);
};

const createShape = ( shape_map_id, shape_name, shape_points ) => {
    const data = {
        shape_map_id: shape_map_id,
        shape_name: shape_name,
        shape_points: shape_points
    }
    return HTTPClient.post(`${BASE_API_PATH}/shapes`, data);
}

export default {
    getShapes,
    createShape
}