/**
 * @file
 * Contains shared, generic utilities for data transformation.
 */

/**
 * CSV extracted data helper.
 *
 * Both csvLine and keys arrays MUST have the same size (required to match).
 */
const arr2Props = (csvLine, keys) => {
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
 * Sorts object keys in the order specified by given array.
 *
 * The order of keys must be the same for the props2Arr() function to work.
 * @see scripts/experiments/ecometrics/extract.js
 *
 * @param {Object} o : the object whose keys are to be sorted.
 * @param {Array} orderedKeys : array of keys in the correct order.
 */
const sortObjectKeys = (o, orderedKeys) => {
	const orderedObj = {};
	orderedKeys.forEach(key => orderedObj[key] = o[key]);
	return orderedObj;
};

/**
 * Generates a 53-bit hash.
 *
 * See https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript/52171480#52171480
 */
const cyrb53 = (str, seed = 0) => {
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

module.exports = {
	arr2Props,
	sortObjectKeys,
	cyrb53
};
