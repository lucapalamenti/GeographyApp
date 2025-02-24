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

const svg = document.querySelector('SVG');
const promptBar1 = document.getElementById('prompt-bar-1');
const promptBar2 = document.getElementById('prompt-bar-2');
const input = promptBar2.querySelector('INPUT');
const tooltip = document.getElementById('tooltip');
let strong;
let tally;

let arr;
let current;

let numPrompts;
let numCorrect = 0;
let guesses = 0;
const clickColors = [ 'rgb(106, 235, 89)', 'rgb(240, 219, 35)', 'rgb(243, 148, 24)', 'rgb(235, 89, 89)' ];

function clickGamemodes( shapeNames, endless ) {
    numPrompts = endless ? "Endless" : shapeNames.length;
    document.querySelectorAll('G').forEach( group => {
        group.classList.add('groupClickable');
    });

    strong = promptBar1.querySelector('STRONG');
    tally = promptBar1.querySelector('#tally');
    tally.textContent = `Correct: ${numCorrect}/${numPrompts}`;

    arr = shuffleArray( shapeNames );
    current = arr.pop();
    updateLabels();
    promptBar1.style.display = "flex";

    svg.addEventListener('mousemove', e => {
        tooltip.style.transform = `translate( calc( -50% + ${e.clientX}px ), calc( -150% + ${e.clientY}px ) )`;
        tooltip.style.display = "block" ;
    });
    svg.addEventListener('mouseout', e => {
        tooltip.style.display = "none" ;
    });
}
function click ( shapeNames ) {
    clickGamemodes( shapeNames, false );
    svg.addEventListener('click', e => {
        const group = e.target.parentNode;
        if ( group.classList.contains('groupClickable') ) {
            // Correct region clicked
            if ( group.getAttribute('id') === inputToClass( current ) ) {
                if ( guesses === 0 ) numCorrect++;
                next( group );
            }
            // Incorrect region clicked
            else {
                guesses++;
                disappearTrigger( group, clickColors[3] );
                // If too many guesses have been taken then highlight the correct answer
                if ( guesses === clickColors.length - 1 )
                    next( svg.getElementById( inputToClass( current ) ) );
                incorrect( group );
            }
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
            if ( group.getAttribute('id') === inputToClass( current ) ) {
                if ( guesses === 0 ) numCorrect++;
                next( group );
            }
            // Incorrect region clicked
            else {
                guesses++;
                disappearTrigger( group, clickColors[3] );
                // If too many guesses have been taken then highlight the correct answer
                if ( guesses === clickColors.length - 1 )
                    next( svg.getElementById( inputToClass( current ) ) );
            }
        }
    });
    function next( group ) {
        disappearTrigger( group );
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

function incorrect( group ) {
    const label = document.createElement('P');
    label.textContent = group.getAttribute('id');
    label.classList.add('incorrectLabel');

    svg.after( label );
    console.log( 'here ' );
}

function typeGamemodes( shapeNames, endless ) {
    numPrompts = endless ? "Endless" : shapeNames.length;
    
    tally = promptBar2.querySelector('#tally');
    tally.textContent = `Correct: ${numCorrect}/${numPrompts}`;

    arr = shuffleArray( shapeNames );
    current = arr.pop();
    promptBar2.style.display = "flex";
    input.focus();
}
function type( shapeNames ) {
    typeGamemodes( shapeNames, false );
    input.addEventListener('keypress', e => {
        if ( e.key === 'Enter' ) {
            // Only check the value if it isn't blank
            if ( input.value !== '' ) {
                const group = svg.querySelector(`#${inputToClass( input.value )}`);
                if ( group && !group.classList.contains('typed') ) {
                    group.classList.add('typed');
                    input.value = "";
                    numCorrect++;
                }
            }
        }
        tally.textContent = `${numCorrect}/${numPrompts}`;
        if ( numCorrect === numPrompts )
            endGame();
    });
}
function typeHard( shapeNames, endless ) {
    promptBar2.querySelector('P').textContent = "Name the highlighted region";
    typeGamemodes( shapeNames, endless );

    let currentGroup = svg.querySelector(`#${inputToClass( current )}`);
    let endlessQueue = [current];
    currentGroup.classList.add('typeCurrent');

    input.addEventListener('keypress', e => {
        // When enter button pressed
        if ( e.key === 'Enter' ) {
            // Only check the value if it isn't blank
            if ( input.value !== '' ) {
                // If input is correct
                if ( input.value.toLowerCase() === current.toLowerCase() ) {
                    currentGroup.classList.remove('typeCurrent');
                    currentGroup.querySelectorAll('POLYGON').forEach( polygon => {
                        polygon.style.fill = clickColors[guesses];
                        if ( endless ) disappearTrigger( currentGroup );
                    });
                    if ( guesses === 0 ) numCorrect++;
                    next();
                }
                // If input is incorrect
                else {
                    guesses++;
                    if ( guesses === clickColors.length - 1 ) {
                        currentGroup.querySelectorAll('POLYGON').forEach( polygon => {
                            polygon.style.fill = clickColors[guesses];
                            if ( endless ) disappearTrigger( currentGroup );
                        });
                        next();
                    }
                }
            }
        }
        tally.textContent = `Correct: ${numCorrect}/${numPrompts}`;
    });
    function next() {
        input.value = "";
        if ( !( current = arr.pop() ) ) {
            endGame();
        } else {
            currentGroup = svg.querySelector(`#${inputToClass( current )}`);
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

function noMap( shapeNames ) {  }

function noList( shapeNames ) {  }

function disappearTrigger( group, color ) {
    group.classList.remove('groupClickable');
    group.querySelectorAll('POLYGON').forEach( polygon => {
        polygon.style.fill = color ? color : clickColors[guesses];
        // Hold for 1 second
        setTimeout( function() {
            polygon.style.transition = 'fill 1s ease';
            polygon.style.fill = '';
            // Fade out for 1 second
            setTimeout( function() {
                polygon.style.transition = '';
                group.classList.add('groupClickable');
            }, 1000 );
        }, 1000 );
    });
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

function inputToClass( input ) {
    return input.split(' ').join('_').split("'").join('-').toLowerCase();
}

function endGame() {
    current = "-";
    updateLabels();
    input.setAttribute('disabled', true);
    console.log( "YOU WIN!" );
}