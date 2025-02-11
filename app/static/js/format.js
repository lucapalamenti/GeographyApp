/**
 * Input an array of strings. Each string is a Geometry "points" attribute.
 * Returns the first parameter for a Multipolygon
 * Ex:
 * Input  = "58,26 227,26 230,146 37,136 17,47 58,26"
 * Output = "((58 26, 227 26, 230 146, 37 136, 17 47, 58 26))"
 * @param {Array<String>} strArr 
 */
const pointsToMultiPolygon = ( strArr ) => {
    const arr = [];
    strArr.forEach( pointsSet => {
        let pointsArr = pointsSet.split(' ');
        for ( let i = 0; i < pointsArr.length; i++ ) {
            // Replace ',' with ' '
            pointsArr[i] = pointsArr[i].split(',').join(' ');
        }
        // pointsArr: ["12 13", "83 10", "23 73"]
        pointsArr = pointsArr.join(',');
        // pointsArr: ["12 13,83 10,23 73"]
        arr.push( pointsArr );
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

    })
};

export default {
    pointsToMultiPolygon,
    shapeToPoints
}