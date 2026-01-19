export default class ParentChildMap {
    // Alabama :
    //     {
    //         Lauderdale : 141
    //         Washington : 167
    //     }
    // Georgia :
    //     {
    //         Appling : 651
    //         Washington : 794
    //     }
    /** @type {Map<String,Map<String,Number>>} */
    #map = null;

    constructor () {
        this.#map = new Map();
    }

    addParent( name ) {
        this.#map.set( name, new Map() );
    }

    addChild( parentName, childName, id ) {
        this.#map.get( parentName ).set( childName, id );
    }

    hasChild( parentName, childName ) {
        const parent = this.#map.get( parentName );
        return ( parent ) ? parent.has( childName ) : false;
    }

    getChild( parentName, childName ) {
        const parent = this.#map.get( parentName );
        return ( parent ) ? parent.get( childName ) : undefined;
    }

    getParentNames() {
        return [...this.#map.keys()];
    }

    getChildNames( parentName ) {
        return [...this.#map.get( parentName ).keys()];
    }

    numChildren() {
        let rtn = 0;
        for ( const parentName of this.getParentNames() ) {
            rtn += this.#map.get( parentName ).size;
        }
        return rtn;
    }
}