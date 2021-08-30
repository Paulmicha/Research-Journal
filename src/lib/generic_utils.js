
/**
 * Utility to convert any CSS value in pixels.
 *
 * Temporarily creates an empty div inside the element (position:'absolute')
 * to measure the real pixel value given by the browser, of any CSS unit.
 */
export const toPixels = (value, el) => {
	let test = document.createElement('div');
	Object.assign(test.style, {
		position: 'absolute',
		width: value
	});
	el.appendChild(test);
	let pixels = test.offsetWidth;
	el.removeChild(test);
	return pixels;
};

/**
 * Re-orders randomly all items in given array.
 */
export const randomizeArray = arr => {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
};

/**
 * Formats number for display.
 *
 * Small values (between -10 and +10) are displayed with up to 2 decimal digits.
 * Bigger values are formatted given international standard conventions ('fr-FR'
 * by default).
 */
export const displayNb = (n, intlNbFormat = 'fr-FR') => {
	let result;
	if (n > 10 || n < -10) {
		result = parseInt(n);
		result = new Intl.NumberFormat(intlNbFormat).format(result);
	} else {
		result = n.toFixed(2);
	}
	return result;
};

/**
 * Formats values to limit the number of decimal characters displayed.
 *
 * @param {Number} n : the number to format.
 * @param {Integer} x : maximum decimal characters to display.
 * @return {Number} : the formatted number.
 */
export const limitDecimals = (n, x) =>  Math.round(n * Math.pow(10, x)) / Math.pow(10, x);

/**
 * Returns a % representing the position of a value in given range.
 */
export const getValuePercentInRange = (value, min, max) => (value - min) / (max - min) * 100;

/**
 * Flips given object keys and values.
 *
 * See https://stackoverflow.com/a/31614602/2592338
 *
 * @param {Object} o the object to flip.
 * @returns {Object} the flipped object.
 *
 * @example
 *   objectFlip({ a: 'foo', b: 'bar' });
 *   // result : { foo: 'a', bar: 'b' }
 */
export const objectFlip = o => Object.entries(o)
	.reduce((obj, [key, value]) => ({ ...obj, [value]: key }), {});
