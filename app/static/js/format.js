import APIClient from './APIClient.js';
/**
 * Input an array of strings. Each string is a Geometry "points" attribute.
 * Returns a Multipolygon
 * Ex:
 * Input  = "58,26 227,26 230,146 37,136 17,47 58,26"
 * Output = "((58 26, 227 26, 230 146, 37 136, 17 47, 58 26))"
 * @param {Array<String>} strArr 
 */
const pointsToMultiPolygon = ( strArr ) => {
    const arr = [];
    strArr.forEach( pointsSet => {
        const pointsArr = pointsSet.split(' ');
        for ( let i = 0; i < pointsArr.length; i++ ) {
            // Replace ',' with ' '
            pointsArr[i] = pointsArr[i].split(',').join(' ');
        }
        arr.push( pointsArr.join(',') );
    });
    return `MULTIPOLYGON(((${arr.join(')),((')})))`;
};

/**
 * Input a shape object and return the corresponding set of points
 * for a Polygon element
 * @param {Shape} shape 
 */
const shapeToPoints = ( shape ) => {
    const MultiPolygon = shape.shape_points.coordinates;
    MultiPolygon.forEach( polygon => {
        console.log( polygon );
    })
};

const shapeToInsertQuery = ( shapeData ) => {
    return `${shapeData.shape_map_id}, '${shapeData.shape_name}', ST_GEOMFROMTEXT('${pointsToMultiPolygon([shapeData.shape_points])}')`;
};

export default {
    pointsToMultiPolygon,
    shapeToPoints,
    shapeToInsertQuery
}