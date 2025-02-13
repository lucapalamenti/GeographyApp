import APIClient from '../APIClient.js';
import format from '../format.js';

const shapeNames = ["topLeft","topRight","bottomLeft","bottomRight"];
const shapePoints = [
    "100,100 300,100 300,300 100,300 100,100",
    "300,100 500,100 500,300 300,300",
    "100,300 300,300 300,500 100,500",
    "300,300 500,300 500,500 300,500"
];
const b1 = document.querySelector('#b1');

b1.addEventListener('click', () => {
    for ( let i = 0; i < shapeNames.length; i++ ) {
        const data = {
            string: `${i+1}, 0, '${shapeNames[i]}', ST_GEOMFROMTEXT('${format.pointsToMultiPolygon( [shapePoints[i]] )}')`
        };
        APIClient.shapeToInsertQuery( data );
    }
});