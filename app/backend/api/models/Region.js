const { SQLGeometry } = require("./SQLGeometry.js");

module.exports = class Region {
    /** @type {Number} */
    region_id = null;
    /** @type {String} */
    region_name = null;
    /** @type {String} */
    region_type = null;
    /** @type {Number} */
    region_parent_id = null;
    /** @type {Number} */
    region_template_id = null;
    /** @type {SQLGeometry} */
    region_points = null;

    static INSERT_STATEMENT_STARTER = `INSERT INTO \`region\` (\`region_id\`, \`region_name\`, \`region_type\`, \`region_parent_id\`, \`region_template_id\`, \`region_points\`) VALUES\n`;

    /**
     * Constructor given Region object data
     * @param {Region} data 
     */
    constructor ( data ) {
        this.region_id = data.region_id;
        this.region_name = data.region_name;
        this.region_type = data.region_type;
        this.region_parent_id = data.region_parent_id;
        this.region_template_id = data.region_template_id;
        this.region_points = SQLGeometry.createAnyType( data.region_points );
    }

    /**
     * Returns the SQL insert statement for this Region object
     * @returns {String}
     */
    insertStatement() {
        return `${INSERT_STATEMENT_STARTER}(${this.region_id}, "${this.region_name}", "${this.region_type}", ${this.region_parent_id}, ${this.region_template_id}, ${this.region_points.toQueryStringWrapped()});`;
    }
    insertStatementLn() {
        return `${this.insertStatement()}\n`;
    }
    insertStatement_valuesOnly() {
        return `(${this.region_id}, "${this.region_name}", "${this.region_type}", ${this.region_parent_id}, ${this.region_template_id}, ${this.region_points.toQueryStringWrapped()}),`
    }
    insertStatementLn_valuesOnly() {
        return `${this.insertStatement_valuesOnly()}\n`;
    }
};