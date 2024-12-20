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

const createShape = ( shape_map_id, shape_name, shape_points ) => {
    return database.query('INSERT INTO shape (shape_map_id, shape_name, shape_points) VALUES (?,?,?)', [shape_map_id, shape_name, shape_points]).then( rows => {
        if ( rows.affectedRows === 1 ) {
            return getShapeById( rows.insertId );
        }
        throw new Error('Shape could not be created!');
    });
};

module.exports = {
    getShapes,
    getShapeById,
    createShape
};