import APIClient from '../APIClient.js';
import US_states_polygon from '../../test/US_states_polygon.js';

const text = US_states_polygon.text;
const b1 = document.querySelector('#b1');
const SVG_WIDTH = 1600; // in pixels
const SVG_HEIGHT = 900; // in pixels
const PADDING = 10; // in pixels

b1.addEventListener('click', () => {
    let tokens = text.split('<polygon id="');
    // Shift to remove unwanted first element
    tokens.shift();
    tokens.forEach( token => {
        let newTokens = token.split( '"' );
        const shapeData = {
            shape_map_id: 1,
            shape_name: newTokens[0].toLowerCase(),
            shape_points: newTokens[2]
        };
        APIClient.createShape( shapeData );
    });
});