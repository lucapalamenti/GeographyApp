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
let numCorrect = 0;
let guesses = 0;
const clickColors = [ 'rgb(106, 235, 89)', 'rgb(240, 219, 35)', 'rgb(243, 148, 24)', 'rgb(235, 89, 89)' ];

function click ( shapeNames ) {
    const promptBar = promptBar1;
    // Add mouse event listeners to each polygon
    document.querySelectorAll('G').forEach( group => {
        group.classList.add('groupClickable');
    });

    const strong = promptBar.querySelector('STRONG');
    let arr = shuffleArray( shapeNames );
    
    let current = arr.pop();
    strong.textContent = capitalizeFirst( current );
    promptBar.style.display = "flex";
    const tally = promptBar.querySelector('#tally');
    tally.textContent = `Correct: ${numCorrect}/${shapeNames.length}`;

    svg.addEventListener('click', e => {
        const group = e.target;
        if ( Array( group.classList ).includes('groupClickable') ) {
            // Correct region clicked
            if ( group.getAttribute('id') === current.split(' ').join('_') ) {
                if ( guesses === 0 ) { numCorrect++; }
                document.querySelectorAll(`.${group.className.baseVal}`).forEach( polygon => {
                    polygon.style.fill = clickColors[guesses];
                    polygon.classList.add('polygonCorrect');
                });
                tally.textContent = `Correct: ${numCorrect}/${shapeNames.length}`;
                if ( !( current = arr.pop() ) ) {
                    strong.textContent = '-';
                    endGame();
                } else {
                    strong.textContent = capitalizeFirst( current );
                    guesses = 0;
                }
            }
            // Incorrect region clicked
            else {
                guesses++;
                document.querySelectorAll(`.${group.className.baseVal}`).forEach( polygon => {
                    polygon.classList.add('polygonClicked');
                    polygon.style.fill = 'rgb(235, 89, 89)';
                    disappearTrigger( polygon );
                });
                // If too many guesses have been taken
                if ( guesses === clickColors.length - 1 ) {
                    // Highlight the correct answer
                    document.querySelectorAll(`.${current.split(' ').join('_')}`).forEach( polygon => {
                        polygon.style.fill = clickColors[guesses];
                        polygon.classList.add('polygonCorrect');
                    });
                    if ( !( current = arr.pop() ) ) {
                        endGame();
                    } else {
                        strong.textContent = capitalizeFirst( current );
                        guesses = 0;
                    }
                }
            }
        }
    });
}
// function click ( shapeNames ) { clickGamemodes( shapeNames, false, false ); }
function clickDisappear ( shapeNames ) { clickGamemodes( shapeNames, true, false ); }
function clickEndless ( shapeNames ) { clickGamemodes( shapeNames, true, true ); }

function clickGamemodes( shapeNames, disappear, endless ) {
    const promptBar = promptBar1;

    const totalShapes = endless ? Infinity : shapeNames.length;
    const strong = promptBar.querySelector('STRONG');
    let arr = shuffleArray( shapeNames );
    
    let current = arr.pop();
    strong.textContent = capitalizeFirst( current );
    let endlessQueue = [current];
    promptBar.style.display = "flex";
    const tally = promptBar.querySelector('#tally');
    tally.textContent = `Correct: ${numCorrect}/${totalShapes}`;

    svg.addEventListener('click', e => {
        const target = e.target;
        if ( target.nodeName === "polygon" && target.classList.length === 1 ) {
            // Correct region clicked
            if ( target.className.baseVal === current.split(' ').join('_') ) {
                if ( guesses === 0 ) { numCorrect++; }
                document.querySelectorAll(`.${target.className.baseVal}`).forEach( polygon => {
                    polygon.style.fill = clickColors[guesses];
                    // Disappear gamemode
                    if ( disappear ) {
                        polygon.classList.add('polygonClicked');
                        disappearTrigger( polygon );
                    }
                    // Standard gamemode
                    else {
                        polygon.classList.add('polygonCorrect');
                    }
                });
                tally.textContent = `Correct: ${numCorrect}/${totalShapes}`;
                if ( !( current = arr.pop() ) ) {
                    strong.textContent = '-';
                    endGame();
                } else {
                    strong.textContent = capitalizeFirst( current );
                    // Endless gamemode
                    if ( endless ) { runEndless(); }
                    guesses = 0;
                }
            }
            // Incorrect region clicked
            else {
                guesses++;
                document.querySelectorAll(`.${target.className.baseVal}`).forEach( polygon => {
                    polygon.classList.add('polygonClicked');
                    polygon.style.fill = 'rgb(235, 89, 89)';
                    disappearTrigger( polygon );
                });
                // If too many guesses have been taken
                if ( guesses === clickColors.length - 1 ) {
                    // Highlight the correct answer
                    document.querySelectorAll(`.${current.split(' ').join('_')}`).forEach( polygon => {
                        polygon.style.fill = clickColors[guesses];
                        // Disappear gamemode
                        if ( disappear ) {
                            polygon.classList.add('polygonClicked');
                            disappearTrigger( polygon );
                        }
                        // Standard gamemode
                        else {
                            polygon.classList.add('polygonCorrect');
                        }
                    });
                    if ( !( current = arr.pop() ) ) {
                        endGame();
                    } else {
                        strong.textContent = capitalizeFirst( current );
                        // Endless gamemode
                        if ( endless ) runEndless();
                        guesses = 0;
                    }
                }
            }
        }
    });
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

function type( shapeNames ) { typeGamemodes( shapeNames, false, false ); }
function typeHard( shapeNames ) { typeGamemodes( shapeNames, true, false ); }
function typeEndless( shapeNames ) { typeGamemodes( shapeNames, true, true ); }

function typeGamemodes( shapeNames, hard, endless ) {
    const totalShapes = endless ? Infinity : shapeNames.length;
    const promptBar = promptBar2;
    const tally = promptBar.querySelector('#tally');
    tally.textContent = `Correct: ${numCorrect}/${totalShapes}`;
    const input = promptBar.querySelector('INPUT');
    input.focus();

    let arr = shuffleArray( shapeNames );

    // For hard and endless type gamemodes
    if ( hard ) {
        let current = arr.pop();
        let currentShapes = document.querySelectorAll(`.${current.split(' ').join('_')}`);
        let endlessQueue = [current];
        currentShapes.forEach( polygon => {
            polygon.style.fill = 'rgb(0, 255, 213)';
        });

        promptBar.querySelector('P').textContent = "Name the highlighted region";
        promptBar.style.display = "flex";

        // When enter button is pressed
        input.addEventListener('keypress', e => {
            if ( e.key === 'Enter' ) {
                // Only check the value if it isn't blank
                if ( input.value !== '' ) {
                    // If input is correct
                    if ( input.value.toLowerCase() === current.toLowerCase() ) {
                        currentShapes.forEach( polygon => {
                            polygon.style.fill = clickColors[guesses];
                            if ( endless ) {
                                polygon.classList.add('polygonClicked');
                                disappearTrigger( polygon );
                            }
                        });
                        if ( guesses === 0 ) { numCorrect++; }
                        input.value = "";
                        if ( !( current = arr.pop() ) ) {
                            endGame();
                        } else {
                            currentShapes = document.querySelectorAll(`.${current.split(' ').join('_')}`);
                            currentShapes.forEach( polygon => {
                                polygon.style.fill = 'rgb(0, 255, 213)';
                            });
                            // Endless gamemode
                            if ( endless ) { runEndless(); }
                            guesses = 0;
                        }
                    }
                    // If input is incorrect
                    else {
                        guesses++;
                        if ( guesses === clickColors.length - 1 ) {
                            currentShapes.forEach( polygon => {
                                polygon.style.fill = clickColors[guesses];
                                if ( endless ) {
                                    polygon.classList.add('polygonClicked');
                                    disappearTrigger( polygon );
                                }
                            });
                            input.value = "";
                            if ( !( current = arr.pop() ) ) {
                                endGame();
                            } else {
                                currentShapes = document.querySelectorAll(`.${current.split(' ').join('_')}`);
                                currentShapes.forEach( polygon => {
                                    polygon.style.fill = 'rgb(0, 255, 149)';
                                });
                                // Endless gamemode
                                if ( endless ) { runEndless(); }
                                guesses = 0;
                            }
                        }
                    }
                }
            }
            tally.textContent = `Correct: ${numCorrect}/${totalShapes}`;
        });
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
    // For standard type gamemode
    else {
        promptBar.style.display = "flex";
        input.addEventListener('keypress', e => {
            if ( e.key === 'Enter' ) {
                // Only check the value if it isn't blank
                if ( input.value !== '' ) {
                    const typedShapes = document.querySelectorAll(`.${input.value.split(' ').join('_').toLowerCase()}`);
                    shapeNames.every( name => {
                        // If the input value is a valid shape name
                        if ( name.toLowerCase() === input.value.toLowerCase() ) {
                            typedShapes.forEach( polygon => {
                                polygon.style.fill = 'rgb(106, 235, 89)';
                            });
                            input.value = "";
                            numCorrect++;
                            return false;
                        }
                        // If the input value is an invalid shape name
                        return true;
                    });
                    
                }
            }
            tally.textContent = `${numCorrect}/${totalShapes}`;
            if ( numCorrect === totalShapes ) {
                endGame();
            }
        });
    }
}

function noMap( shapeNames ) {

}

function noList( shapeNames ) {

}

function endGame() {
    const input = promptBar.querySelector('INPUT');
    input.setAttribute('disabled', true);
    console.log( "YOU WIN!" );
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

function disappearTrigger( polygon ) {
    setTimeout( function() {
        polygon.style.transition = 'fill 1s ease';
        polygon.style.fill = '';
        setTimeout( function() {
            polygon.style.transition = '';
            polygon.classList.remove('polygonClicked');
        }, 1000 );
    }, 1000 );
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