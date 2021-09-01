/**
 * @file
 * Assembles the SVG code for inlining specific icons.
 *
 * This will generate and overwrite the JSON file static/data/devicesIcons.json
 * that contains the SVG code as strings.
 *
 * @see scripts/experiments/ecometrics/icons
 *
 * @example
 *  # From project docroot.
 *  node scripts/icons.js
 */

const fs = require('fs');
const path = require('path');
const { write_file } = require('./fs');

const conf = [
	{
		src: 'scripts/experiments/ecometrics/icons/device',
		dest: 'static/data/devicesIcons.json'
	},
	{
		src: 'scripts/experiments/ecometrics/icons/service',
		dest: 'static/data/servicesIcons.json'
	}
];

conf.forEach(c => {
	const icons = {};
	let ext = '';
	let filePath = '';

	fs.readdirSync(c.src).forEach(file => {
		ext = path.extname(file);
		filePath = path.join(c.src, file);
		if (fs.statSync(filePath).isFile() && ext === '.svg') {
			icons[path.basename(file, ext)] = fs.readFileSync(filePath).toString();
		}
	});

	write_file(c.dest, JSON.stringify(icons));
});
