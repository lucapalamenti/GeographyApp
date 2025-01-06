import APIClient from './APIClient.js';
import US_states from '../test/US_states.js';

const text = US_states.text;
const button = document.querySelector('BUTTON');
const svg = document.querySelector('SVG');

document.addEventListener('DOMContentLoaded', () => {
    APIClient.getShapes().then( returnedShapes => {
        returnedShapes.forEach( shape => {
            const polygon = document.getElementById('polygon-template').content.cloneNode(true).querySelector('POLYGON');
            polygon.setAttribute('class', shape.shape_name);
            polygon.setAttribute('points', shape.shape_points);
            svg.appendChild( polygon );
            polygon.addEventListener('mouseover', () => {
                document.querySelectorAll(`.${polygon.className.baseVal}`).forEach( eWithSameClass => {
                    eWithSameClass.style.fill = "lime";
                });
            });
            polygon.addEventListener('mouseout', () => {
                document.querySelectorAll(`.${polygon.className.baseVal}`).forEach( eWithSameClass => {
                    eWithSameClass.style.fill = "";
                });
            });
        });
    }).catch( err => {
        console.error( err );
    });
});

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

button.addEventListener('click', () => {
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
    // map looks like: {name:filtered}
    // Alabama: ["1.1,2.2 2.2,3.3", "1.5,2.3 1.5,3.5"]
    // 2. Second, using the map of all groups of polygons, we need to find the widest
    Object.values( map ).forEach( value => {
        let minX = 180;
        let maxX = -180;
        value.forEach( set => {
            let updatedPoints = set.split(',0.0 ');
            // Trim off the last ',0.0'
            const L = updatedPoints.length;
            updatedPoints[ L - 1 ] = updatedPoints[ L - 1 ].substring(0, updatedPoints[ L - 1 ].length - 4);
            // updatedPoints now looks like this
            // ["-80.123456,30.123456", "-81.123456,31.123456"]
            
            for ( let i = 0; i < L; i++ ) {
                // Looks like ["-80.123456", "30.123456"]
                let xy = updatedPoints[i].split(',');
                const x = Number( xy[0] );
                if ( x < minX ) {
                    minX = x;
                } else if ( x > maxX ) {
                    if ( x < 0 ) {
                        maxX = x;
                    }
                }
            }
        });
        if ( maxX - minX > maxWidth ) {
            maxWidth = maxX - minX;
        }
    });
    
    Object.entries( map ).forEach( ([name, filtered]) => {

        let xValues = [];
        let yValues = [];
        // For each set of points for THIS POLYGON
        // 1. First we need to find the min/max x/y values so we know how far to offset hthe polygons
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

        const minX = Math.min( ...xValues );
        const maxY = Math.max( ...yValues );

        const offsetX = 13;
        const offsetY = -25;
        
        // For each set of points for THIS POLYGON
        // 2. Now we can create the polygons
        filtered.forEach( set => {
            let updatedPoints = set.split(',0.0 ');
            // Trim off the last ',0.0'
            const L = updatedPoints.length;
            updatedPoints[ L - 1 ] = updatedPoints[ L - 1 ].substring(0, updatedPoints[ L - 1 ].length - 4);

            for ( let i = 0; i < L; i++ ) {
                let xy = updatedPoints[i].split(',');
                let x = Math.round( ( ( Number( xy[0] ) - minX ) * ( 10 /* 1600 / maxWidth */ ) + offsetX ) * 1000000 ) / 1000000;
                let y = Math.round( ( ( Number( xy[1] ) - maxY ) * ( 10 /* 1600 / maxWidth */ ) + offsetY ) * 1000000 ) / -1000000;
                updatedPoints[i] = `${x},${y}`;
            }

            // let updatedPoints3 = updatedPoints.join(' ');

            const MAX_PAYLOAD_LENGTH = 1000;
            const shapeData = {
                shape_map_id: 0,
                shape_name: name,
                shape_points: updatedPoints.slice( 0, MAX_PAYLOAD_LENGTH ).join(' ')
            };
            // If there are too many points to send over the payload
            if ( updatedPoints.length >  MAX_PAYLOAD_LENGTH ) {
                // Start off by creating part of the Polygon
                APIClient.createShape( shapeData ).then( async shape => {
                    for ( let i = MAX_PAYLOAD_LENGTH; i < updatedPoints.length; i += MAX_PAYLOAD_LENGTH ) {
                        const appendData = {
                            shape_id: shape.shape_id,
                            shape_points: updatedPoints.slice( i, i + MAX_PAYLOAD_LENGTH ).join(' ')
                        };
                        await APIClient.appendPoints( appendData ).then( shape => {

                        }).catch( err => {
                            console.error( err, "ERROR 1" );
                        });
                    }
                    
                    
                }).catch( err => {
                    console.error( err, "ERROR 2" );
                });
            } else {
                APIClient.createShape( shapeData ).then( shape => {
                    
                }).catch( err => {
                    console.error( err, "ERROR 3" );
                });
            }
        });
    });
});