import APIClient from '../APIClient.js';
// import US_Counties from '../../test/US_Counties.js';

// const text = US_Counties.text;
const b1 = document.querySelector('#b1');
const SVG_WIDTH = 1600; // in pixels
const SVG_HEIGHT = 900; // in pixels
const Y_SCALE = 1.25; // stretches in Y axis to account for squished appearance
const PADDING = 20; // in pixels

const ALASKA_SCALE_X = 0.75;

const mapIdCode = {
    "01": 3,
    "02": 4,
    "04": 5,
    "05": 6,
    "06": 7,
    "08": 8,
    "09": 9,
    "10": 10,
    "12": 11,
    "13": 12,
    "15": 13,
    "16": 14,
    "17": 15,
    "18": 16,
    "19": 17,
    "20": 18,
    "21": 19,
    "22": 20,
    "23": 21,
    "24": 22,
    "25": 23,
    "26": 24,
    "27": 25,
    "28": 26,
    "29": 27,
    "30": 28,
    "31": 29,
    "32": 30,
    "33": 31,
    "34": 32,
    "35": 33,
    "36": 34,
    "37": 35,
    "38": 36,
    "39": 37,
    "40": 38,
    "41": 39,
    "42": 40,
    "44": 41,
    "45": 42,
    "46": 43,
    "47": 44,
    "48": 45,
    "49": 46,
    "50": 47,
    "51": 48,
    "53": 49,
    "54": 50,
    "55": 51,
    "56": 52
};

b1.addEventListener('click', async () => {
    let tokens = text.split('<Placemark>').slice(1);
    let tokens2 = [];
    tokens.forEach( t => {
        const name = t.split('<SimpleData name="NAMELSAD">')[1].split('</SimpleData>')[0].split(' County')[0];
        const map_id = mapIdCode[t.split('<SimpleData name="STATEFP">')[1].split('</SimpleData>')[0]];
        // points is a collection of polygon's points for one county
        let points = t.split('<coordinates>').slice(1);
        // Only continue if the map_id is for one of the 50 states
        if ( map_id ) {
            points.forEach( async p => {
                tokens2.push( {
                    shape_map_id: map_id,
                    shape_name: name,
                    shape_points: p.split('</coordinates>')[0]
                });
            });
        }
    });

    let tokensByMapId = [];
    // Add 50 empty arrays
    for ( let i = 0; i < 50; i++ ) { tokensByMapId.push([]); }
    tokens2.forEach( t => {
        tokensByMapId[ t.shape_map_id - 3 ].push( t );
    });

    tokensByMapId.forEach( async state => {
        // For testing only do alabama
        if ( state[0].shape_map_id == 3 ) {
            // Find the min and max X & Y values for the map
            let maxWidth = 0;
            let minX = 0;
            let maxX = -180;
            let minY = 180;
            let maxY = -180;
            state.forEach( polygon => {
                let points = polygon.shape_points.split(' ');
                points.forEach( pair => {
                    let xy = pair.split(',');
                    const x = Number( xy[0] );
                    const y = Number( xy[1] );
                    if ( x < minX ) minX = x;
                    if ( x > maxX && x < 0 ) maxX = x; // Just for Aleutians West which have positive X coordiates
                    if ( y < minY ) minY = y;
                    if ( y > maxY ) maxY = y;
                });
            });

            const scaleX = ( state[0].shape_map_id == "4" ) ? ALASKA_SCALE_X : 1;
            
            const multiplier = Math.min( ( SVG_WIDTH - PADDING * 2 ) / ( maxX - minX ), ( SVG_HEIGHT - PADDING * 2 ) / ( maxY - minY ) / Y_SCALE );
            state.forEach( async polygon => {
                let points = polygon.shape_points.split(' ');
                for ( let i = 0; i < points.length; i++ ) {
                    let xy = points[i].split(',');
                    const x = Math.round( ( ( Number( xy[0] ) - minX ) * multiplier * scaleX + PADDING ) * 1000000 ) / 1000000;
                    const y = Math.round( ( ( Number( xy[1] ) - maxY ) * multiplier * Y_SCALE - PADDING ) * 1000000 ) / -1000000;
                    points[i] = `${x},${y}`;
                }
                
                const MAX_PAYLOAD_LENGTH = 1000;
                const shapeData = {
                    shape_map_id: polygon.shape_map_id,
                    shape_name: polygon.shape_name,
                    shape_points: points.slice( 0, MAX_PAYLOAD_LENGTH ).join(' ')
                };
                // Start off by creating part of the Polygon
                await APIClient.createShape( shapeData ).then( async shape => {
                    // If there are too many points to send over the payload the first time, send in multiple payloads
                    for ( let i = MAX_PAYLOAD_LENGTH; i < points.length; i += MAX_PAYLOAD_LENGTH ) {
                        const appendData = {
                            shape_id: shape.shape_id,
                            shape_points: points.slice( i, i + MAX_PAYLOAD_LENGTH ).join(' ')
                        };
                        try {
                            await APIClient.appendPoints( appendData );
                        } catch ( err ) {
                            console.error( err, "ERROR 1" );
                        }
                    }
                }).catch( err => {
                    console.error( err, "ERROR 2" );
                });
            });
        }
    });
});