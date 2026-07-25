import BackendMapRegion from "./BackendMapRegion.js";
import Region from "./Region.js";

export default class MapData {
    /** @type {Array<BackendMapRegion>} */
    mapRegions = null;
    /** @type {Array<Region>} */
    parentRegions = null;

    /**
     * Constructor given an object with the structure of a MapData object
     * @param {MapData} data 
     */
    constructor ( data ) {
        this.mapRegions = data.mapRegions.map( e => new BackendMapRegion( e ) );
        this.parentRegions = data.parentRegions.map( e => new Region( e ) );
    }

    /**
     * Returns the parent Region object from the parentRegions array with the given id
     * @param {number} region_parent_id 
     * @returns {Region}
     * @throws
     */
    getParentRegion( region_parent_id ) {
        for ( const region of this.parentRegions ) {
            if ( region.region_id === region_parent_id ) {
                return region;
            }
        }
        throw new Error( `Parent id ${region_parent_id} not found!` );
    }
}