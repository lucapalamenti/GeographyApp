module.exports = class TempData {
    /** @type {number} */
    tempData_id = null;
    /** @type {Object} */
    tempData_data = null;

    /**
     * 
     * @param {TempData} data 
     */
    constructor ( data ) {
        this.tempData_id = data.tempData_id;
        this.tempData_data = data.tempData_data;
    }
}