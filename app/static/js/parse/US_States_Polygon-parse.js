import APIClient from '../APIClient.js';
import format from '../format.js';
import US_States_Polygon from '../../test/US_States_Polygon.js';

const text = US_States_Polygon.text;
const b1 = document.querySelector('#b1');
const SVG_WIDTH = 1600; // in pixels
const SVG_HEIGHT = 900; // in pixels
const PADDING = 10; // in pixels

b1.addEventListener('click', () => {
    // Shift to remove unwanted first element
    let tokens = text.split('<polygon id="');
    tokens.shift();
    tokens.forEach( token => {
        const newTokens = token.split( '"' );
        let points = newTokens[2];
        // Add first point as last point
        points = points.concat( ' ', points.substring( 0, points.indexOf(' ') ) );
        const shapeData = {
            shape_map_id: 1,
            shape_name: newTokens[0].toLowerCase(),
            shape_points: format.pointsToMultiPolygon( [points] )
        };
        APIClient.createShape( shapeData );
    });
});