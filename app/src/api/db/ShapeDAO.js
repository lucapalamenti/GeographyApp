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

const getShapeByMapIdParentName = async ( shapeData ) => {
    const { mapShape_map_id, mapShape_parent, shape_name } = shapeData;
    return await database.query(`
        SELECT * FROM mapShape JOIN shape
        ON mapShape_shape_id = shape_id
        WHERE mapShape_map_id = ? AND mapShape_parent = ? AND shape_name = ?
        `, [mapShape_map_id, mapShape_parent, shape_name.split('-').join("'")]).then( rows => {
            if ( rows.length === 1 ) {
                return new Shape( rows[0] );
            }
            throw new Error('Shape not found!');
    });
}

const getShapesByMapId = async ( mapShape_map_id ) => {
    return await database.query(`
        SELECT * FROM mapShape JOIN shape
        ON mapShape_shape_id = shape_id
        WHERE mapShape_map_id = ?
        ORDER BY shape_name
        `, [mapShape_map_id]).then( rows => {
            return rows;
    });
};

const getShapeParentsForMap = async ( mapShape_map_id ) => {
    return await database.query(`
        SELECT DISTINCT mapShape_parent FROM mapShape
        WHERE mapShape_map_id = ?
        `, [mapShape_map_id]).then( rows => {
            const parents = [];
            rows.forEach( row => {
                parents.push( row.mapShape_parent );
            });
            return parents;
    });
};

const getMapShape = async ( mapShape_map_id, mapShape_shape_id ) => {
    return await database.query(`
        SELECT * FROM mapShape
        WHERE mapShape_map_id = ? AND mapShape_shape_id = ?
        `, [mapShape_map_id, mapShape_shape_id]).then( rows => {
            if ( rows.length ) {
                return rows[0];
            } else {
                return {
                    mapShape_id : -1,
                    mapShape_map_id : -1,
                    mapShape_shape_id : -1,
                    mapShape_parent : '',
                    mapShape_offsetX : 0,
                    mapShape_offsetY : 0,
                    mapShape_scaleX : 1,
                    mapShape_scaleY : 1,
                };
            }
    });
};

const createShape = async ( shapeData ) => {
    const { shape_name, shape_points } = shapeData;
    return await database.query(`
        INSERT INTO shape (shape_name, shape_points)
        VALUES (?, ST_GEOMFROMTEXT(?))
        `, [shape_name, shape_points]).then( rows => {
            if ( rows.affectedRows === 1 ) {
                return getShapeById( rows.insertId );
            }
            throw new Error('Shape could not be created!');
    });
};

const createMapShape = async ( mapShapeData ) => {
    const { mapShape_map_id, mapShape_shape_id, mapShape_parent, mapShape_offsetX, mapShape_offsetY, mapShape_scaleX, mapShape_scaleY } = mapShapeData;
    return await database.query(`
        INSERT INTO mapShape (mapShape_map_id, mapShape_shape_id, mapShape_parent, mapShape_offsetX, mapShape_offsetY, mapShape_scaleX, mapShape_scaleY)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [mapShape_map_id, mapShape_shape_id, mapShape_parent, mapShape_offsetX, mapShape_offsetY, mapShape_scaleX, mapShape_scaleY]).then( rows => {
            if ( rows.affectedRows === 1 ) {
                return getShapeById( mapShape_shape_id );
            }
            throw new Error('mapShape could not be created!');
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
    getShapeByMapIdParentName,
    getShapesByMapId,
    getMapShape,
    getShapeParentsForMap,
    createShape,
    createMapShape,
    deleteShapesFromMap
};