const svg = document.querySelector('SVG');
const promptBar = document.getElementById('prompt-bar');
const input = promptBar.querySelector('INPUT');
const promptLabel = promptBar.querySelector('P');
const tally = promptBar.querySelector('#tally');

const tooltip = document.getElementById('tooltip');

let arr;
let current;

let numPrompts;
let numCorrect = 0;
let guesses = 0;
const clickColors = [ 'rgb(106, 235, 89)', 'rgb(240, 219, 35)', 'rgb(243, 148, 24)', 'rgb(235, 89, 89)' ];

const SVG_WIDTH = 1600;
const SVG_HEIGHT = 900;

function clickGamemodes( shapeNames, endless ) {
    numPrompts = endless ? "Endless" : shapeNames.length;
    document.querySelectorAll('G').forEach( group => {
        group.classList.add('groupClickable');
    });

    promptLabel.textContent = "Click on";
    input.style.display = 'none';
    tally.textContent = `Correct: ${numCorrect}/${numPrompts}`;

    arr = shuffleArray( shapeNames );
    current = arr.pop();
    updateLabels();
    
    promptBar.style.display = "flex";

    svg.addEventListener('mousemove', moveToolTip );
    svg.addEventListener('scroll', moveToolTip );
    svg.addEventListener('mouseout', e => {
        tooltip.style.display = "none" ;
    });
    function moveToolTip( e ) {
        tooltip.style.transform = `translate( calc( -50% + ${e.clientX}px ), calc( 60% + ${e.clientY + window.scrollY}px ) )`;
        tooltip.style.display = "block";
    }
}
function click ( shapeNames ) {
    clickGamemodes( shapeNames, false );
    svg.addEventListener('click', e => {
        const group = e.target.parentNode;
        if ( group.classList.contains('groupClickable') ) {
            // Correct region clicked
            if ( group.getAttribute('id') === inputToId( current ) ) {
                if ( guesses === 0 ) numCorrect++;
                next( group );
            }
            // Incorrect region clicked
            else {
                guesses++;
                shapeDisappearTrigger( group, clickColors[3], true );
                // If too many guesses have been taken then highlight the correct answer
                if ( guesses === clickColors.length - 1 ) {
                    clickLabel( svg.getElementById( inputToId( current ) ), e, true );
                    next( svg.getElementById( inputToId( current ) ) );
                }
            }
            clickLabel( group, e, false );
        }
    });
    function next( group ) {
        group.classList.remove('groupClickable');
        group.querySelectorAll('POLYGON').forEach( polygon => {
            polygon.style.fill = clickColors[guesses];
        });
        if ( !( current = arr.pop() ) ) {
            endGame();
        } else {
            updateLabels();
            guesses = 0;
        }
        tally.textContent = `Correct: ${numCorrect}/${numPrompts}`;
    }
}
function clickDisappear ( shapeNames, endless ) {
    clickGamemodes( shapeNames, endless );
    // For endless gamemode
    let endlessQueue = [current];
    svg.addEventListener('click', e => {
        const group = e.target.parentNode;
        if ( group.classList.contains('groupClickable') ) {
            // Correct region clicked
            if ( group.getAttribute('id') === inputToId( current ) ) {
                if ( guesses === 0 ) numCorrect++;
                next( group );
            }
            // Incorrect region clicked
            else {
                guesses++;
                shapeDisappearTrigger( group, clickColors[3], true );
                // If too many guesses have been taken then highlight the correct answer
                if ( guesses === clickColors.length - 1 ) {
                    next( svg.getElementById( inputToId( current ) ) );
                }
            }
            clickLabel( group, e );
        }
    });
    function next( group ) {
        shapeDisappearTrigger( group, clickColors[guesses], true );
        if ( !( current = arr.pop() ) ) {
            endGame();
        } else {
            updateLabels();
            if ( endless ) runEndless();
            guesses = 0;
        }
        tally.textContent = `Correct: ${numCorrect}/${numPrompts}`;
    }
    function runEndless() {
        endlessQueue.push( current );
        if ( endlessQueue.length > arr.length) {
            // Pick a random index in the front half of the waiting queue
            const index1 = Math.floor( Math.random() * endlessQueue.length / 2 );
            // Pick a random index in the back half of the current queue
            const index2 = Math.floor( Math.random() * arr.length / 2 );
            // Insert the value from waiting queue into the current queue
            arr = arr.slice( 0, index2 ).concat( endlessQueue.at( index1 ), arr.slice( index2 ) );
            endlessQueue = endlessQueue.slice(0, index1).concat( endlessQueue.slice( index1 + 1 ) );
        }
    }
}
function clickEndless( shapeNames ) { clickDisappear( shapeNames, true ) }

function clickLabel( group, e, center ) {
    const p = document.createElement('P');
    p.classList.add('clickLabel');
    p.textContent = idToInput( group.id );
    if ( center ) {
        const rect = group.getBoundingClientRect();
        p.style.transform = `translate( calc( -50% + ${rect.left + rect.width / 2}px ), calc( -50% + ${rect.top + rect.height / 2}px ) )`;
    } else {
        p.style.transform = `translate( calc( -50% + ${e.clientX}px ), calc( -120% + ${e.clientY + window.scrollY}px ) )`;
    }
    tooltip.before( p );

    // Show for 1.5 seconds
    setTimeout( function() {
        tooltip.parentNode.removeChild( p );
    }, 1500 );
}

function typeGamemodes( shapeNames, endless ) {
    numPrompts = endless ? "Endless" : shapeNames.length;
    tally.textContent = `Correct: ${numCorrect}/${numPrompts}`;
    arr = shuffleArray( shapeNames );
    current = arr.pop();
    promptBar.style.display = "flex";
    input.focus();
}
function type( shapeNames ) {
    typeGamemodes( shapeNames, false );
    promptLabel.textContent = "Name all regions";
    input.addEventListener('keypress', e => {
        if ( e.key === 'Enter' ) {
            // Only check the value if it isn't blank
            if ( input.value !== '' ) {
                const group = svg.querySelector(`#${inputToId( input.value )}`);
                if ( group && !group.classList.contains('typed') ) {
                    group.classList.add('typed');
                    input.value = "";
                    numCorrect++;
                }
            }
        }
        tally.textContent = `${numCorrect}/${numPrompts}`;
        if ( numCorrect === numPrompts ) endGame();
    });
}
function typeHard( shapeNames, endless ) {
    promptLabel.textContent = "Name the highlighted region";
    typeGamemodes( shapeNames, endless );

    let currentGroup = svg.querySelector(`#${inputToId( current )}`);
    let endlessQueue = [current];
    currentGroup.classList.add('typeCurrent');

    input.addEventListener('keypress', e => {
        if ( e.key === 'Enter' ) {
            // Only check the value if it isn't blank
            if ( input.value !== '' ) {
                // If input is correct
                if ( input.value.toLowerCase() === current.toLowerCase() ) next(); 
                // If input is incorrect
                else {
                    guesses++;
                    // If too many guesses have been given
                    if ( guesses === clickColors.length - 1 ) next();
                }
            }
        }
        tally.textContent = `Correct: ${numCorrect}/${numPrompts}`;
    });
    function next() {
        currentGroup.classList.remove('typeCurrent');
        currentGroup.querySelectorAll('POLYGON').forEach( polygon => {
            polygon.style.fill = clickColors[guesses];
            if ( endless ) shapeDisappearTrigger( currentGroup, clickColors[guesses], false );
        });
        if ( guesses === 0 ) numCorrect++;
        input.value = "";
        if ( !( current = arr.pop() ) ) {
            endGame();
        } else {
            currentGroup = svg.querySelector(`#${inputToId( current )}`);
            currentGroup.classList.add('typeCurrent');
            // Endless gamemode
            if ( endless ) runEndless();
            guesses = 0;
        }
    }
    function runEndless() {
        endlessQueue.push( current );
        if ( endlessQueue.length > arr.length) {
            // Pick a random index in the front half of the waiting queue
            const index1 = Math.floor( Math.random() * endlessQueue.length / 2 );
            // Pick a random index in the back half of the current queue
            const index2 = Math.floor( Math.random() * arr.length / 2 );
            // Insert the value from waiting queue into the current queue
            arr = arr.slice( 0, index2 ).concat( endlessQueue.at( index1 ), arr.slice( index2 ) );
            endlessQueue = endlessQueue.slice(0, index1).concat( endlessQueue.slice( index1 + 1 ) );
        }
    }
}
function typeEndless( shapeNames ) { typeHard( shapeNames, true ); }

function noMap( shapeNames ) {
    const noMapArea = document.getElementById('no-map-area');
    numPrompts = shapeNames.length;

    let n = 1;
    const arr = {};
    shapeNames.forEach( name => {
        arr[ inputToId( name ) ] = n++;
    });

    for ( let i = 0; i < numPrompts; i++ ) {
        noMapArea.appendChild( document.createElement('P') );
    }

    promptLabel.textContent = "Name all regions";
    tally.textContent = `Correct: ${numCorrect}/${numPrompts}`;
    noMapArea.style.display = "flex";
    
    document.getElementById('game-area').removeChild( document.getElementById('svg-container') );
    promptBar.style.display = "flex";

    input.addEventListener('keypress', e => {
        if ( e.key === 'Enter' ) {
            // Only check the value if it isn't blank
            if ( input.value !== '' ) {
                const myInput = inputToId( input.value );
                if ( arr[ myInput ] ) {
                    const correctNode = noMapArea.childNodes[ arr[ myInput ] ];
                    correctNode.textContent = idToInput( myInput );
                    correctNode.style["background-color"] = "rgb(75, 255, 75)";
                    correctNode.style["border"] = "1px solid green";
                    arr[ myInput ] = null;
                    input.value = "";
                    numCorrect++;
                }
            }
        }
        tally.textContent = `Correct: ${numCorrect}/${numPrompts}`;
        if ( numCorrect === numPrompts ) endGame();
    });
}

function noList( shapeNames ) {  }

function shapeDisappearTrigger( group, color, clickable ) {
    group.classList.remove('groupClickable');
    group.querySelectorAll('POLYGON').forEach( polygon => {
        polygon.style.fill = color;
        // Hold for 1 second
        setTimeout( function() {
            polygon.style.transition = 'fill 1s ease';
            polygon.style.fill = '';
            // Fade out for 1 second
            setTimeout( function() {
                polygon.style.transition = '';
                if ( clickable ) group.classList.add('groupClickable');
            }, 1000 );
        }, 1000 );
    });
}

/**
 * Updates all labels with the class 'click-on' to contain the current shape
 * to click on
 */
function updateLabels() {
    document.querySelectorAll('.click-on').forEach( label => {
        label.textContent = capitalizeFirst( current );
    });
}

/**
 * Randomly shuffles an array
 * @param {Array} arr 
 */
function shuffleArray( arr ) {
    for ( let i = arr.length - 1; i >= 0; i-- ) {
        const j = Math.floor( Math.random() * i );
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
}

/**
 * Capitalizes the firt letter of each word (separated by a space) in a string
 * @param {String} string 
 */
function capitalizeFirst( string ) {
    const arr = string.split(' ');
    for ( let i = 0; i < arr.length; i++ ) {
        arr[i] = arr[i].slice(0, 1).toUpperCase().concat( arr[i].slice(1) );
    }
    return arr.join(' ');
}

function inputToId( input ) {
    return input.split(' ').join('_').split("'").join('-').toLowerCase();
}
function idToInput( id ) {
    return capitalizeFirst( id.split('_').join(' ').split('-').join("'") );
}

function endGame() {
    current = "-";
    updateLabels();
    input.setAttribute('disabled', true);
    console.log( "YOU WIN!" );
}

// Right click to zoom
svg.addEventListener( 'contextmenu', e => { e.preventDefault(); });
svg.addEventListener( 'contextmenu', zoom );
function zoom( e ) {
    const rect = svg.getBoundingClientRect();
    // X coordinate of zoom viewport
    let startX = ( e.clientX - rect.left ) * SVG_WIDTH / rect.width - SVG_WIDTH / 10;
    // Y coordinate of zoom viewport
    let startY = ( e.clientY - rect.top ) * SVG_HEIGHT / rect.height - SVG_HEIGHT / 10;
    // Adjust so zoom is not greater than original viewport
    startX = startX < 0 ? 0 : ( startX > SVG_WIDTH * 0.8 ? SVG_WIDTH * 0.8 : startX );
    startY = startY < 0 ? 0 : ( startY > SVG_HEIGHT * 0.8 ? SVG_HEIGHT * 0.8 : startY );

    svg.setAttribute('viewBox', `${startX} ${startY} ${ SVG_WIDTH / 5 } ${ SVG_HEIGHT / 5 }`);
    svg.classList.add('zoomed');
    svg.removeEventListener( 'contextmenu', zoom );
}

// Escape key to unzoom
document.addEventListener('keydown', e => {
    if ( e.key === 'Escape' ) unzoom();
});
function unzoom() {
    svg.classList.remove('zoomed');
    svg.setAttribute('viewBox', "0 0 1600 900");
    svg.addEventListener( 'contextmenu', zoom );
}

export const gamemodeMap = {
    'click': click,
    'clickDisappear': clickDisappear,
    'clickEndless': clickEndless,
    'type': type,
    'typeHard': typeHard,
    'typeEndless': typeEndless,
    'noMap': noMap,
    'noList': noList
};