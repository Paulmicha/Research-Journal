/**
 * @file
 * Custom sapper export wrapper script.
 *
 * It seems the crawler is unable to follow links that are rendered to the DOM
 * during the Svelte afterUpdate "hook".
 * @see src/routes/[...slug].svelte
 *
 * This script adds all page paths using the '--entry' arg.
 */

// import * as fs from 'fs';
// import * as path from 'path';
// import { exec } from 'child_process';
// const fs = require('fs');
// const path = require('path');
const { walk } = require('./fs.js');
const { exec } = require('child_process');

const paths = [];
const dir = 'static/data/entities/content/page';

walk(dir).map(filepath => {
	const entry = filepath.replace('static/data/entities/content/page/', '').replace('.json', '');
	// if (entry.includes('/')) {
		paths.push('/' + entry);
	// }
});
paths.push('/');

// Debug.
// console.log(`npx sapper export --legacy --entry '${paths.join(' ')}'`);

exec(
	`npx sapper export --legacy --entry '${paths.join(' ')}'`,
	(err, stdout, stderr) => {
		if (err) {
			console.log(err);
			return;
		}
		console.log(`stdout:\n${stdout}`);
		console.log(`stderr:\n${stderr}`);
	}
);
