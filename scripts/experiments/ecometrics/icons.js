/**
 * @file
 * Assembles the SVG code for inlining specific icons.
 *
 * This will generate and overwrite the JSON files that contain the SVG code as
 * strings.
 *
 * @see scripts/experiments/ecometrics/icons
 *
 * @example
 *  # From project docroot.
 *  node scripts/ecometrics/icons.js
 */

import * as fs from 'fs';
import * as path from 'path';
import { writeFile } from '../fs';

const conf = [
	{
		src: 'scripts/experiments/ecometrics/icons/device',
		dest: 'content/devicesIcons.json'
	},
	{
		src: 'scripts/experiments/ecometrics/icons/service',
		dest: 'content/servicesIcons.json'
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

	writeFile(c.dest, JSON.stringify(icons));
});
