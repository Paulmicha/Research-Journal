
/**
 * Utility to convert any CSS value in pixels.
 *
 * Temporarily creates an empty div inside the element (position:'absolute')
 * to measure the real pixel value given by the browser, of any CSS unit.
 */
const toPixels = (value, el) => {
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

export { toPixels };
