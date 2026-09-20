const apostropheReplacement = "--";
const spaceReplacement = "_";

/**
 * Capitalizes the firt letter of each word (separated by a space) in a string
 * @param {String} string 
 */
export function capitalizeFirst( string ) {
    const arr = string.split(' ');
    for ( let i = 0; i < arr.length; i++ ) {
        arr[i] = arr[i].slice(0, 1).toUpperCase().concat( arr[i].slice(1) );
    }
    return arr.join(' ');
}

export function idToInput( id ) {
    return capitalizeFirst( id.split(spaceReplacement).join(' ') ).split(apostropheReplacement).join("'");
};

export function inputToId( input ) {
    return input.split(' ').join(spaceReplacement).split("'").join(apostropheReplacement).toLowerCase();
};

/**
 * 
 * @param {() => {}} cb 
 * @param {number} delay 
 * @returns {() => {}}
 */
export function debounce( cb, delay = 1000 ) {
    let timeout;
    return (...args) => {
        clearTimeout( timeout );
        timeout = setTimeout(() => {
            cb(...args);
        }, delay);
    }
}

/**
 * 
 * @param {() => {}} cb 
 * @param {number} delay 
 * @returns {() => {}}
 */
export function throttle( cb, delay = 50 ) {
    let shouldWait = false;
    let waitingArgs;
    const timeoutFunc = () => {
        setTimeout(() => {
            if ( waitingArgs ) {
                cb( ...waitingArgs );
                waitingArgs = null;
                setTimeout( timeoutFunc, delay );
            } else {
                shouldWait = false;
            }
        }, delay);
    };

    return ( ...args ) => {
        if ( shouldWait ) {
            waitingArgs = args;
            return;
        }

        cb( ...args );
        shouldWait = true;
        setTimeout( timeoutFunc, delay );
    }
}
