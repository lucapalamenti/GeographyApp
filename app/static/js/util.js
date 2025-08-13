const apostropheReplacement = "--";
const spaceReplacement = "_";

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

const idToParent = ( id ) => {
    return capitalizeFirst( id.split('__')[0].split(spaceReplacement).join(' ') );
};

const idToInput = ( id ) => {
    return capitalizeFirst( id.split(spaceReplacement).join(' ') ).split(apostropheReplacement).join("'");
};

const inputToId = ( input ) => {
    return input.split(' ').join(spaceReplacement).split("'").join(apostropheReplacement).toLowerCase();
};

const inputToQuery = ( input ) => {
    return capitalizeFirst( input.split(' ').join(spaceReplacement).split("'").join(`${apostropheReplacement}`).toLowerCase() );
};

export default {
    capitalizeFirst,
    idToParent,
    idToInput,
    inputToId,
    inputToQuery
}