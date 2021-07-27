/**
 * @file
 * Assembles the SVG code for inlining specific icons.
 *
 * This will generate and overwrite the JSON file static/data/devicesIcons.json
 * that contains the SVG code as strings.
 *
 * @see scripts/experiments/ecometrics/icons
 */

const fs = require('fs');
const path = require('path');
const { write_file } = require('./fs');

const icons = {};
const dir = 'scripts/experiments/ecometrics/icons';

let ext = '';
let filePath = '';

fs.readdirSync(dir).forEach(file => {
	ext = path.extname(file);
	filePath = path.join(dir, file);
	if (fs.statSync(filePath).isFile() && ext === '.svg') {
		icons[path.basename(file, ext)] = fs.readFileSync(filePath).toString();
	}
});

write_file('static/data/devicesIcons.json', JSON.stringify(icons));
