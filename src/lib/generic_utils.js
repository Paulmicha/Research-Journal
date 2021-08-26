
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
 */
export const displayNb = n => {
	let result;
	if (n > 10) {
		result = parseInt(n);
		result = new Intl.NumberFormat('fr-FR').format(result);
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
export const getValuePercentInRange = (value, min, max) => {
	return (value - min) / (max - min) * 100;
};
