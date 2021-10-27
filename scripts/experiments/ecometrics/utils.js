/**
 * @file
 * Contains shared, generic utilities for data transformation.
 */

import * as fs from 'fs';

/**
 * Converts given CSV file path to an array of arrays (lines x columns).
 *
 * @param {String} csvFile : CSV file path.
 * @param {String} separator : [optional] character delimiting columns. Defaults
 *  to ','.
 * @returns {Array} array of arrays (lines x columns).
 */
export const csv2Arr = (csvFile, separator = ',') => fs.readFileSync(csvFile)
	.toString() // convert Buffer to string
	.split('\n') // split string to lines
	.map(e => e.trim()) // remove white spaces for each line
	.map(e => e
		.split(separator) // split each line to array
		.map(e => e.trim()) // remove white spaces for each column
	)
	.filter(e => e != null && e != ''); // remove empty lines

/**
 * CSV extracted data helper.
 *
 * Both csvLine and keys arrays MUST have the same size (required to match).
 */
export const arr2Props = (csvLine, keys) => {
	const obj = {};
	csvLine.forEach((value, i) => {
		if (!keys[i]) {
			return
		}
		obj[keys[i]] = value;
	});
	return obj;
};

/**
 * Sqlite INSERT format helper.
 */
export const props2Arr = eqObj => {
	const flattenedValues = [];
	Object.keys(eqObj).forEach(prop => {
		if (Array.isArray(eqObj[prop]) || typeof(eqObj[prop]) === 'object') {
			flattenedValues.push(JSON.stringify(eqObj[prop]));
		} else {
			flattenedValues.push(eqObj[prop]);
		}
	});
	return flattenedValues;
};

/**
 * Sorts object keys in the order specified by given array.
 *
 * This will also strip the object of any keys that are not in given list,
 * except 'postprocess'.
 *
 * The order of keys must be the same for the props2Arr() function to work.
 * @see scripts/experiments/ecometrics/extract.js
 *
 * @param {Object} o : the object whose keys are to be sorted.
 * @param {Array} orderedKeys : array of keys in the correct order.
 */
export const sortObjectKeys = (o, orderedKeys) => {
	const orderedObj = {};
	orderedKeys.forEach(key => orderedObj[key] = o[key]);

	// Keep custom postprocess data (this extra temporary key will be stripped
	// during post processing).
	if ('postprocess' in o) {
		orderedObj.postprocess = o.postprocess;
	}

	return orderedObj;
};

/**
 * Generates a 53-bit hash.
 *
 * See https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript/52171480#52171480
 */
export const cyrb53 = (str, seed = 0) => {
	let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) {
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
	h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
	return 4294967296 * (2097151 & h2) + (h1>>>0);
};
