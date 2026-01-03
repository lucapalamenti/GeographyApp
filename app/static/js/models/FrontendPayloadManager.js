/**
 * Manages chunkifying payloads and storing them in groups
 * 
 * @typedef {Number} PayloadGroupId The index of the group in the PayloadManager's groupCluster that this chunk is a part of
 */
export class FrontendPayloadManager {
    /** Maximum size in bytes for a single payload fragment */
    static MAX_PAYLOAD_SIZE = 100000;
    /** An array of group IDs for all payloads currently transporting to the backend
     * @type {Array<PayloadGroupId>} */
    static #cluster = [];

    /**
     * Finds the first available position in the payload cluster and initializes it by returning the index of this position 
     * @returns {PayloadGroupId}
     */
    static requestGroup() {
        let idx = 0;
        while ( this.#cluster[idx] != undefined ) idx++;
        this.#cluster[idx] = idx;
        return idx;
    }
    
    /**
     * Removes the group with the given groupId from the PayloadManager's cluster
     * @param {PayloadGroupId} groupId 
     */
    static removeGroup( groupId ) {
        const idx = this.#cluster.indexOf( groupId );
        if ( idx === -1 ) {
            throw new Error( `No PayloadGroup with Id "${groupId}" found in the cluster` );
        }
        this.#cluster[ idx ] = undefined;
    }
}

/**
 * Abstract class for sending data to the backend via HTTP request.
 * A group ID allows Chunks of the same group to find eachother in the backend
 */
class Chunk {
    /** @type {PayloadGroupId} */
    groupId = null;

    /**
     * @param {PayloadGroupId} groupId 
     */
    constructor ( groupId ) {
        if ( new.target === Chunk ) {
            throw new TypeError( "Cannot instantiate abstract Chunk object directly" );
        }
        this.groupId = groupId;
    }
}

/**
 * Wrapper class for payload data. If a payload is smaller than MAX_PAYLOAD_SIZE it can be sent as one PayloadChunk, otherwise
 * it must be broken up and sent as multiple PayloadChunks. The Chunk ID tells the backend how to order payload fragments
 * if it receives multiple PayloadChunks for a given payload group
 */
export class PayloadChunk extends Chunk {
    /** The index of this chunk within its payload group
     * @type {Number} */
    chunkId = null;
    /** Some payload data
     * @type {String} */
    payloadFragment = null;

    /**
     * @param {Number} chunkId 
     * @param {PayloadGroupId} groupId 
     * @param {String} payloadFragment 
     */
    constructor ( chunkId, groupId, payloadFragment ) {
        super( groupId );
        this.chunkId = chunkId;
        this.payloadFragment = payloadFragment;
    }
}

/**
 * Sent after all PayloadChunks are sent to tell the backend how many chunks it should
 * expect for a payload group
 */
export class SentinelChunk extends Chunk {
    /** Number of Chunks in the PayloadGroup with the given groupId
     * @type {Number} */
    numberOfChunks = null;

    /**
     * @param {PayloadGroupId} groupId 
     * @param {Number} numberOfChunks 
     */
    constructor ( groupId, numberOfChunks ) {
        super( groupId );
        this.numberOfChunks = numberOfChunks;
    }
}