/**
 * Takes an array of objects and uses binary search to find the object in the array
 * that has the given value for a specific key. The array must be sorted by values
 * of the key "key"
 * @param {Array<T>} array
 * @param {String} key 
 * @param {*} value 
 * @returns {T}
 */
export function objectBinarySearch( array, key, value ) {
    let start = 0;
    let end = array.length - 1;
    // Continue while the search space is valid
    while ( start <= end ) {
        const mid = Math.floor( ( start + end ) / 2 );
        if ( array[mid][key] === value ) {
            return array[mid];
        } else if ( array[mid][key] > value ) {
            end = mid - 1;
        } else {
            start = mid + 1;
        }
    }
    // Object in array with "value" doesn't exist
    return undefined;
}