import APIClient from '../APIClient.js';
// import US_Counties from '../../test/US_Counties.js';

// const text = US_Counties.text;
const b1 = document.querySelector('#b1');
const SVG_WIDTH = 1600; // in pixels
const SVG_HEIGHT = 900; // in pixels
const Y_SCALE = 1.25; // stretches in Y axis to account for squished appearance
const PADDING = 10; // in pixels

const ALASKA_OFFSET_X = 475;
const ALASKA_OFFSET_Y = 900;
const ALASKA_SCALE_X = 0.3;
const ALASKA_SCALE_Y = 0.4;
const HAWAII_OFFSET_X = 1400;
const HAWAII_OFFSET_Y = -225;

const stateNames = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming"
];

b1.addEventListener('click', () => {
    let tokens = text.split('<SimpleData name="NAME">');
    let tokens2 = [];
    // Filter tokens to only contain those with state names
    tokens.forEach( token => {
        stateNames.forEach( name => {
            if ( token.startsWith( name ) ) {
                tokens2.push( token );
            }
        });
    });

    let map = {};
    // Each token is for a GROUP OF POLYGONS
    // 1. First we need to parse the text to contain only the coordinates
    tokens2.forEach( token => {
        let name = token.substring(0, token.indexOf("<") );
        let theRest = token.split("<coordinates>");
        let filtered = [];
        for ( let i = 1; i < theRest.length; i++ ) {
            filtered.push( theRest[i].split("</coordinates>")[0] );
        }
        map[name] = filtered;
    });


    let maxWidth = 0;
    let minX = 180;
    let maxX = -180;
    let minY = 180;
    let maxY = -180;
    // map looks like: {name:filtered}
    // Alabama: ["1.1,2.2 2.2,3.3", "1.5,2.3 1.5,3.5"]
    // 2. Second, using the map of all groups of polygons, we need to find the widest
    Object.entries( map ).forEach( ([shapeName, value]) => {
        let minWidthX = 180;
        let maxWidthX = -180;
        value.forEach( set => {
            const updatedPoints = set.split(',0.0 ');
            const L = updatedPoints.length;
            // Trim off the last ',0.0'
            updatedPoints[ L - 1 ] = updatedPoints[ L - 1 ].substring(0, updatedPoints[ L - 1 ].length - 4);
            // updatedPoints now looks like this
            // ["-80.123456,30.123456", "-81.123456,31.123456"]
            
            for ( let i = 0; i < L; i++ ) {
                // Looks like ["-80.123456", "30.123456"]
                let xy = updatedPoints[i].split(',');
                const x = Number( xy[0] );
                if ( x < minWidthX ) {
                    minWidthX = x;
                } else if ( x > maxWidthX && x < 0 ) {
                    maxWidthX = x;
                }
                // Find min and max X & Y values for contiguous 48 states
                if ( shapeName != "Alaska" && shapeName != "Hawaii" ) {
                    const y = Number( xy[1] );
                    if ( x < minX ) minX = x;
                    if ( x > maxX ) maxX = x;
                    if ( y < minY ) minY = y;
                    if ( y > maxY ) maxY = y;
                }
            }
        });
        if ( maxWidthX - minWidthX > maxWidth ) {
            maxWidth = maxWidthX - minWidthX;
        }
    });
    
    Object.entries( map ).forEach( async ([name, filtered]) => {
        
        let xValues = [];
        let yValues = [];
        // For each set of points for THIS POLYGON
        // 1. First we need to find the min/max x/y values so we know how far to offset the polygons
        filtered.forEach( set => {
            let updatedPoints = set.split(',0.0 ');
            // Trim off the last ',0.0'
            const L = updatedPoints.length;
            updatedPoints[ L - 1 ] = updatedPoints[ L - 1 ].substring(0, updatedPoints[ L - 1 ].length - 4);
            // updatedPoints now looks like this
            // ["-80.123456,30.123456", "-81.123456,31.123456"]
            
            for ( let i = 0; i < L; i++ ) {
                // Looks like ["-80.123456", "30.123456"]
                let xy = updatedPoints[i].split(',');
                xValues.push( Number( xy[0] ) );
                yValues.push( Number( xy[1] ) );
            }
        });

        const multiplier = Math.min( ( SVG_WIDTH - PADDING * 2 ) / ( maxX - minX ), ( SVG_HEIGHT - PADDING * 2 ) / ( maxY - minY ) / Y_SCALE );
        const offsetX = ( name === "Alaska" ) ? ALASKA_OFFSET_X : ( ( name === "Hawaii" ) ? HAWAII_OFFSET_X : 0);
        const offsetY = ( name === "Alaska" ) ? ALASKA_OFFSET_Y : ( ( name === "Hawaii" ) ? HAWAII_OFFSET_Y : 0);
        const scaleX = ( name === "Alaska" ) ? ALASKA_SCALE_X : 1;
        const scaleY = ( name === "Alaska" ) ? ALASKA_SCALE_Y : 1;

        // For each set of points for THIS POLYGON
        // 2. Now we can create the polygons
        await filtered.forEach( async set => {
            let updatedPoints = set.split(',0.0 ');
            // Trim off the last ',0.0'
            const L = updatedPoints.length;
            updatedPoints[ L - 1 ] = updatedPoints[ L - 1 ].substring(0, updatedPoints[ L - 1 ].length - 4);

            for ( let i = 0; i < L; i++ ) {
                let xy = updatedPoints[i].split(',');
                let x = Math.round( ( ( Number( xy[0] ) - minX ) * multiplier * scaleX + PADDING + offsetX ) * 1000000 ) / 1000000;
                let y = Math.round( ( ( Number( xy[1] ) - maxY ) * multiplier * Y_SCALE * scaleY - PADDING - offsetY ) * 1000000 ) / -1000000;
                updatedPoints[i] = `${x},${y}`;
            }

            // let updatedPoints3 = updatedPoints.join(' ');

            const MAX_PAYLOAD_LENGTH = 1000;
            const shapeData = {
                shape_map_id: 2,
                shape_name: name.toLowerCase(),
                shape_points: updatedPoints.slice( 0, MAX_PAYLOAD_LENGTH ).join(' ')
            };
            // If there are too many points to send over the payload
            if ( updatedPoints.length >  MAX_PAYLOAD_LENGTH ) {
                // Start off by creating part of the Polygon
                await APIClient.createShape( shapeData ).then( async shape => {
                    for ( let i = MAX_PAYLOAD_LENGTH; i < updatedPoints.length; i += MAX_PAYLOAD_LENGTH ) {
                        const appendData = {
                            shape_id: shape.shape_id,
                            shape_points: updatedPoints.slice( i, i + MAX_PAYLOAD_LENGTH ).join(' ')
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
            } else {
                try {
                    await APIClient.createShape( shapeData )
                } catch ( err ) {
                    console.error( err, "ERROR 3" );
                }
            }
        });
    });
});