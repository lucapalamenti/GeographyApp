const svg = document.querySelector('SVG');
const promptBar = document.getElementById('prompt-bar');
const input = promptBar.querySelector('INPUT');
const promptLabel = promptBar.querySelector('P');
const incorrectLabel = promptBar.querySelector('#incorrectLabel');
const tally = promptBar.querySelector('#tally');

const tooltip = document.getElementById('tooltip');

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
                incorrect( group, e );
                shapeDisappearTrigger( group, clickColors[3], true );
                // If too many guesses have been taken then highlight the correct answer
                if ( guesses === clickColors.length - 1 )
                    next( svg.getElementById( inputToId( current ) ) );
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
            if ( group.getAttribute('id') === inputToId( current ) ) {
                if ( guesses === 0 ) numCorrect++;
                next( group );
            }
            // Incorrect region clicked
            else {
                guesses++;
                incorrect( group, e );
                shapeDisappearTrigger( group, clickColors[3], true );
                // If too many guesses have been taken then highlight the correct answer
                if ( guesses === clickColors.length - 1 )
                    next( svg.getElementById( inputToId( current ) ) );
            }
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

function incorrect( group, e ) {
    const p = document.createElement('P');
    p.classList.add('incorrectLabel');
    p.textContent = idToInput( group.id );
    p.style.transform = `translate( calc( -50% + ${e.clientX}px ), calc( -120% + ${e.clientY + window.scrollY}px ) )`;
    tooltip.before( p );

    // Hold for 1 second WORK ON THISSSSSSSSSSSSSSS
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
        if ( numCorrect === numPrompts )
            endGame();
    });
}
function typeHard( shapeNames, endless ) {
    promptLabel.textContent = "Name the highlighted region";
    typeGamemodes( shapeNames, endless );

    let currentGroup = svg.querySelector(`#${inputToId( current )}`);
    let endlessQueue = [current];
    currentGroup.classList.add('typeCurrent');

    input.addEventListener('keypress', e => {
        // When enter button pressed
        if ( e.key === 'Enter' ) {
            // Only check the value if it isn't blank
            if ( input.value !== '' ) {
                // If input is correct
                if ( input.value.toLowerCase() === current.toLowerCase() ) {
                    next();
                }
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
    numPrompts = shapeNames.length;

    tally.textContent = `Correct: ${numCorrect}/${numPrompts}`;
    
    document.querySelector('#game-area').removeChild( svg );
    promptBar.style.borderBottom = "3px solid rgb(28, 134, 64)";
    promptBar.style.display = "flex";
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
