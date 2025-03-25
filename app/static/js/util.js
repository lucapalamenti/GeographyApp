/**
 * Capitalizes the firt letter of each word (separated by a space) in a string
 * @param {String} string 
 */
const capitalizeFirst = ( string ) => {
    const arr = string.split(' ');
    for ( let i = 0; i < arr.length; i++ ) {
        arr[i] = arr[i].slice(0, 1).toUpperCase().concat( arr[i].slice(1) );
    }
    return arr.join(' ');
}

const idToListItem = ( id ) => {
    const split = id.split('__');
    // if there is no parent name
    if ( split[0] === '' ) {
        return capitalizeFirst( split[1].split('_').join(' ') );
    } else {
        return `${capitalizeFirst( split[1].split('_').join(' ') )} (${split[0].split('_').join(' ')})`;
    }
}

const inputToId = ( input ) => {
    return input.split(' ').join('_').split("'").join('-').toLowerCase();
}

const idToInput = ( id ) => {
    return capitalizeFirst( id.split('__')[1].split('_').join(' ').split('-').join("'") );
}

export default {
    capitalizeFirst,
    idToListItem,
    inputToId,
    idToInput
}