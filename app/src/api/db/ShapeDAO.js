const database = require('./databaseConnections.js');
const Shape = require('./models/Shape.js');

const getShapes = () => {
    return database.query('SELECT * FROM shape', []).then( rows => {
        return rows.map( row => new Shape( row ) );
    });
};

const getShapeById = ( shape_id ) => {
    return database.query('SELECT * FROM shape WHERE shape_id=?', [shape_id]).then( rows => {
        if ( rows.length === 1 ) {
            return new Shape( rows[0] );
        }
        throw new Error('Shape not found!');
    });
};

const getShapesByMapId = ( shape_map_id ) => {
    return database.query('SELECT * FROM shape WHERE shape_map_id=?', [shape_map_id]).then( rows => {
        return rows;
    });
};

const createShape = ( shapeData ) => {
    const { shape_map_id, shape_name, shape_points } = shapeData;
    return database.query('INSERT INTO shape (shape_map_id, shape_name, shape_points) VALUES (?,?,?)', [shape_map_id, shape_name, shape_points]).then( rows => {
        if ( rows.affectedRows === 1 ) {
            return getShapeById( rows.insertId );
        }
        throw new Error('Shape could not be created!');
    });
};

const updatePoints = ( shapeData ) => {
    const { shape_id, shape_points } = shapeData;
    return database.query('UPDATE shape SET shape_points = ? WHERE shape_id = ?', [shape_points, shape_id]).then( rows => {
        if ( rows.affectedRows === 1 ) {
            return getShapeById( shape_id );
        }
        throw new Error('Error appending points to shape!');
    });
};

const appendPoints = ( appendData ) => {
    const { shape_id, shape_points } = appendData;
    return database.query('UPDATE shape SET shape_points = CONCAT(shape_points, ?, ?) WHERE shape_id = ?', [' ', shape_points, shape_id]).then( rows => {
        if ( rows.affectedRows === 1 ) {
            return getShapeById( shape_id );
        }
        throw new Error('Error appending points to shape!');
    });
};

const deleteShapesFromMap = ( mapId ) => {
    return database.query('DELETE FROM shape', [mapId]).then( rows => {
        return rows.affectedRows;
    });
};

module.exports = {
    getShapes,
    getShapeById,
    getShapesByMapId,
    createShape,
    updatePoints,
    appendPoints,
    deleteShapesFromMap
};