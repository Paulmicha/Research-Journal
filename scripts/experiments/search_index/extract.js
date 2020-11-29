/**
 * @file
 * Public URLs data miner based on channels exports.
 *
 * @see scripts/experiments/search_index/fetch.sh
 *
 * @example
 *   # From project docroot :
 *   node scripts/experiments/search_index/extract.js
 */

const { write_file } = require('../../fs');
const { build_channels_urls_index } = require('./lib/parsing');

try {
	write_file(
		'static/data/entities/experiment/search_index.json',
		JSON.stringify(build_channels_urls_index())
	);
} catch (error) {
	console.log(error);
}
