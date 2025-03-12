const database = require('./databaseConnections.js');
const Shape = require('./models/Shape.js');

const getShapes = async () => {
    return await database.query(`
        SELECT * FROM shape
        `, []).then( rows => {
        return rows.map( row => new Shape( row ) );
    });
};

const getShapeById = async ( shape_id ) => {
    return await database.query(`
        SELECT * FROM shape
        WHERE shape_id = ?
        `, [shape_id]).then( rows => {
        if ( rows.length === 1 ) {
            return new Shape( rows[0] );
        }
        throw new Error('Shape not found!');
    });
};

const getShapesByMapId = async ( shape_map_id ) => {
    return await database.query(`
        SELECT * FROM shape
        WHERE shape_map_id = ?
        ORDER BY shape_name
        `, [shape_map_id]).then( rows => {
        return rows;
    });
};

const getShapeOffset = async ( shapeOffset_map_id, shapeOffset_shape_id ) => {
    return await database.query(`
        SELECT * FROM shapeOffset
        WHERE shapeOffset_map_id = ? AND shapeOffset_shape_id = ?
        `, [shapeOffset_map_id, shapeOffset_shape_id]).then( rows => {
        return rows[0];
    });
};

const createShape = async ( shapeData ) => {
    const { shape_map_id, shape_name, shape_points } = shapeData;
    return await database.query(`
        INSERT INTO shape (shape_map_id, shape_name, shape_points)
        VALUES (?, ?, ST_GEOMFROMTEXT(?))
        `, [shape_map_id, shape_name, shape_points]).then( rows => {
        if ( rows.affectedRows === 1 ) {
            return getShapeById( rows.insertId );
        }
        throw new Error('Shape could not be created!');
    });
};

const updatePoints = async ( shapeData ) => {
    const { shape_id, shape_points } = shapeData;
    return await database.query(`
        UPDATE shape SET shape_points = ?
        WHERE shape_id = ?
        `, [shape_points, shape_id]).then( rows => {
        if ( rows.affectedRows === 1 ) {
            return getShapeById( shape_id );
        }
        throw new Error('Error appending points to shape!');
    });
};

const appendPoints = async ( appendData ) => {
    const { shape_id, shape_points } = appendData;
    return await database.query(`
        UPDATE shape SET shape_points = CONCAT(shape_points, ?, ?)
        WHERE shape_id = ?
        `, [' ', shape_points, shape_id]).then( rows => {
        if ( rows.affectedRows === 1 ) {
            return getShapeById( shape_id );
        }
        throw new Error('Error appending points to shape!');
    });
};

const deleteShapesFromMap = async ( mapId ) => {
    return await database.query(`
        DELETE FROM shape
        WHERE map_id = ?
        `, [mapId]).then( rows => {
        return rows.affectedRows;
    });
};

module.exports = {
    getShapes,
    getShapeById,
    getShapesByMapId,
    getShapeOffset,
    createShape,
    updatePoints,
    appendPoints,
    deleteShapesFromMap
};