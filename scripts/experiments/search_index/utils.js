/**
 * @file
 * Contains utilities related to the search index experiment.
 */

/**
 * Only adds entry to dataset if not duplicate.
 *
 * @param {Object} data the whole dataset beign processed
 * @param {String} table name
 * @param {Object} o entity object
 * @param {Array} matchKeys used to match previously created entities.
 * @returns {Integer} the ID of the newly created entity, or of the matching
 *   previously created entity (if any).
 */
export const uniqueEntry = (data, table, o, matchKeys) => {
	for (let i = 0; i < data[table].length; i++) {
		const entry = data[table][i];
		let match = '';
		let compare = '';
		matchKeys.forEach(key => {
			match += o[key] + '.';
			compare += entry[key] + '.';
		});
		if (match === compare) {
			return entry.id;
		}
	}
	data[table].push(o);
	return 'id' in o ? o.id : true;
};

/**
 * Gets DB creation SQL query for SQLite.
 *
 * @param {String} tableName
 * @param {Array} cols names
 * @returns {String} the formatted SQLite query.
 */
export const createTableQuery = (tableName, cols) => {
	let sqlStr = '';
	const colsSqlParts = [];
	const indexes = [];
	const foreignKeys = [];

	cols.forEach(col => {
		if (col === 'id') {
			colsSqlParts.push('id INTEGER PRIMARY KEY AUTOINCREMENT');
		} else if (col.substring(0, 2) === 'id') {
			colsSqlParts.push(col + ' INTEGER');
			const suffix = col.substring(3);
			if (suffix !== 'origin') {
				foreignKeys.push(`FOREIGN KEY(${col}) REFERENCES ${col.substring(3)}(id)`);
			} else {
				indexes.push(col);
			}
		} else {
			colsSqlParts.push(col + ' TEXT');
		}
	});

	sqlStr = `CREATE TABLE ${tableName} (${colsSqlParts.join(', ')}`;
	if (foreignKeys.length) {
		sqlStr += ', ' + foreignKeys.join(', ');
	}
	sqlStr += ');';

	if (indexes.length) {
		indexes.forEach(index => sqlStr += `CREATE INDEX idx_${tableName}_${index} ON ${tableName} (${index});`);
	}

	return sqlStr;
};
