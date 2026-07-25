/**
 * Manages receiving data from the frontend via HTTP requests. Data is expected to be wrapped
 * in a PayloadChunk object, otherwise it is considered invalid and an error is thrown.
 * 
 * @typedef {Number} PayloadGroupId The index of the group in the PayloadManager's groupCluster that this chunk is a part of
 */
module.exports = class BackendPayloadManager {
    /** @type {Array<PayloadGroup>} */
    static #groupCluster = [];

    /**
     * Ensures that all received payloads are wrapped in a PayloadChunk object. Adds Chunks
     * into their designated group in the groupCluster. Once a PayloadGroup is ready to
     * unchunkify, its payload fragments are combined into a JSON object and put into req.body.
     * The PayloadGroup is removed from the cluster since it's no longer needed
     * @param {Request} req 
     * @param {Response} res 
     * @param {Function} next 
     * @throws {TypeError}
     */
    static chunkMiddleware = (req, res, next) => {
        let group;
        if ( this.#isPayloadChunk( req.body ) ) {
            const chunk = new PayloadChunk( req.body );
            group = this.#queryGroup( chunk.groupId );
            group.addChunk( chunk );
        } else if ( this.#isSentinelChunk( req.body ) ) {
            const chunk = new SentinelChunk( req.body );
            group = this.#queryGroup( chunk.groupId );
            group.numberOfChunks = chunk.numberOfChunks;
        } else {
            res.status(500).json( `Chunk data "${req.body}" is invalid` );
            throw new TypeError( `Chunk data "${req.body}" is invalid` );
        }
        if ( group.isReady() ) {
            this.removeGroup( req.body.groupId );
            req.body = group.unchunkify();
            next();
        } else {
            res.status(202).json({ message: `Chunk received` });
        }
    }

    /**
     * Searches the groupCluster for a PayloadGroup. If it already exists then return it, otherwise create a new PayloadGroup with
     * the given ID and return it
     * @param {PayloadGroupId} groupId 
     * @returns {PayloadGroup}
     */
    static #queryGroup( groupId ) {
        let group = this.#groupCluster[groupId];
        return group ? group : this.#groupCluster[groupId] = new PayloadGroup( groupId );
    }

    static removeGroup( groupId ) {
        for ( let i = 0; i < this.#groupCluster.length; i++ ) {
            const group = this.#groupCluster[i];
            if ( group && group.groupId === groupId ) {
                this.#groupCluster[i] = undefined;
            }
        }
    }

    /**
     * Determines if a given JSON object contains the fields required to make a PayloadChunk
     * @param {JSON} data 
     * @returns {Boolean} 
     */
    static #isPayloadChunk( data ) {
        return typeof data.chunkId === "number"
            && typeof data.groupId === "number"
            && typeof data.payloadFragment === "string";
    }

    /**
     * Determines if a given JSON object contains the fields required to make a SentinelChunk 
     * @param {JSON} data 
     * @returns {Boolean}
     */
    static #isSentinelChunk( data ) {
        return typeof data.groupId === "number"
            && typeof data.numberOfChunks === "number";
    }
}

/**
 * Chunks received from the frontend are grouped together into a PayloadGroup based on their
 * groupId, even if the payload is contained entirely within one chunk. Each Chunk's chunkId tells
 * it where to position itself in the chunkArray. numberOfChunks is undefined until a SentinelChunk
 * is received and tells the PayloadGroup how many chunks were sent before it so that if they take
 * longer to arrive than the SentinelChunk itself, then the PayloadGroup knows how many to wait for
 */
class PayloadGroup {
    groupId = null;
    /** @type {Number} */
    numberOfChunks = undefined;
    /** @type {Array<PayloadChunk>} */
    chunkArray = [];

    constructor( groupId ) {
        this.groupId = groupId;
    }
    
    /**
     * Adds a Chunk to the chunk array. An error is thrown if there is already a Chunk
     * at the index it tries to insert itself at
     * @param {PayloadChunk} chunk 
     * @throws {ReferenceError}
     */
    addChunk( chunk ) {
        if ( this.chunkArray[chunk.chunkId] != undefined ) {
            throw new ReferenceError( `There is already a chunk at index ${chunk.chunkId} of group ${chunk.groupId}:\n${this.chunkArray[chunk.chunkId]}` );
        }
        this.chunkArray[chunk.chunkId] = chunk;
    }

    /**
     * A PayloadGroup is ready if a SentinelChunk and all PayloadChunks have been received
     * @returns {Boolean}
     */
    isReady() {
        let rtn = false;
        if ( this.numberOfChunks !== undefined ) {
            rtn = true;
            for ( let i = 0; i < this.numberOfChunks; i++ ) {
                if ( this.chunkArray[i] === undefined ) {
                    rtn = false;
                }
            }
        }
        return rtn;
    }

    /**
     * Converts this group's chunks into a JSON object
     * @returns {JSON}
     */
    unchunkify() {
        return JSON.parse( this.chunkArray.map( chunk => {
            return chunk.payloadFragment;
        }).join( "" ) );
    }
}

/**
 * Abstract class for receiving data from the frontend via HTTP request.
 * A group ID allows Chunks of the same group to find eachother in the backend
 */
class Chunk {
    /** The index of the group in the PayloadManager's groupCluster that this chunk is a part of
     * @type {PayloadGroupId}*/
    groupId = null;

    /**
     * @param {Chunk} data 
     */
    constructor ( data ) {
        if ( new.target === Chunk ) {
            console.error( "Cannot instantiate abstract Chunk object directly" );
            throw new TypeError( "Cannot instantiate abstract Chunk object directly" );
        }
        this.#verifyData( data );
        this.groupId = data.groupId;
    }

    /**
     * Verifies that the given data contains fields to construct a Chunk. A TypeError is thrown if it can't
     * @param {JSON} data 
     * @throws {TypeError}
     */
    #verifyData( data ) {
        if ( typeof data.groupId !== "number" ) {
                console.error( `Chunk data is invalid:` );
                console.error( data );
                throw new TypeError( `Chunk data "${data}" is invalid` );
        }
    }
}

/**
 * Wrapper class for payload data. If a payload is smaller than MAX_PAYLOAD_SIZE it can be sent as one PayloadChunk, otherwise
 * it broken up and received as multiple PayloadChunks. The Chunk ID tells the backend how to order payload fragments
 * if it receives multiple PayloadChunks for a given payload group
 */
class PayloadChunk extends Chunk {
    /** The index of this chunk within its payload group
     * @type {Number} */
    chunkId = null;
    /** Some payload data
     * @type {String} */
    payloadFragment = null;

    /**
     * @param {PayloadChunk} data 
     */
    constructor ( data ) {
        super( data );
        this.#verifyData( data );
        this.chunkId = data.chunkId;
        this.payloadFragment = data.payloadFragment;
    }

    /**
     * Verifies that the given data contains fields to construct a PayloadChunk. A TypeError is thrown if it can't
     * @param {JSON} data 
     * @throws {TypeError}
     */
    #verifyData( data ) {
        if ( typeof data.chunkId !== "number"
            || typeof data.payloadFragment !== "string" && data.payloadFragment !== null ) {
            console.error( `PayloadChunk data "${data}" is invalid` );
            throw new TypeError( `PayloadChunk data "${data}" is invalid` );
        }
    }
}

/**
 * Sent after all PayloadChunks are sent to tell the backend how many chunks it should
 * expect for a payload group
 */
class SentinelChunk extends Chunk {
    /** Number of Chunks in the PayloadGroup with the given groupId
     * @type {Number} */
    numberOfChunks = null;

    /**
     * @param {SentinelChunk} data 
     */
    constructor ( data ) {
        super( data );
        this.#verifyData( data );
        this.numberOfChunks = data.numberOfChunks;
    }

    /**
     * Verifies that the given data contains fields to construct a SentinelChunk. A TypeError is thrown if it can't
     * @param {JSON} data 
     * @throws {TypeError}
     */
    #verifyData( data ) {
        if ( typeof data.numberOfChunks !== "number" ) {
            console.error( `SentinelChunk data "${data}" is invalid` );
            throw new TypeError( `SentinelChunk data "${data}" is invalid` );
        }
    }
}