/**
 * @file
 * Public URLs data miner based on channels exports.
 *
 * @see scripts/experiments/msc_auto_save_bot.sh
 */

const { walk } = require('../fs');

/**
 * Builds our custom data miner cache.
 */
const build_channels_urls_data_miner_cache = () => {
	let raw_data;
	const data = {};

	walk('private/channels', '.json').map(file_path => {
		raw_data = JSON.parse(fs.readFileSync(file_path).toString());

		// TODO [wip]
	});

	return data;
};

module.exports = {
	build_channels_urls_data_miner_cache
};
