/**
 * @file
 * (Re)builds the local file-based cache.
 *
 * TODO ideally this would be hooked into the Sapper app build process (or
 * integrated into the build tool configuration).
 */

const { write_file } = require('./fs');
const { build_page_routing_trails } = require('./routing');
const { build_views_cache } = require('./views');
const { build_taxonomy_cache } = require('./taxonomy');
const { build_channels_urls_data_miner_cache } = require('./experiments/msc_auto_save_bot');

/**
 * Writes the "routing trails" cache to a JSON static file.
 *
 * @see build_page_routing_trails()
 */
const cache_page_routing_trails = () => {
	write_file('static/data/cache/page_routing_trails.json', JSON.stringify(build_page_routing_trails()));
}

/**
 * Writes the views cache.
 *
 * @see build_views_results()
 */
const cache_views_results = () => {
	const {views_in_routes_cache, views_in_entities_cache} = build_views_cache();

	// For views in route handlers, we need to pre-compile every possible argument
	// values as distinct files.
	views_in_routes_cache.forEach(data => {
		const file_path = data.storage.file_path;
		delete data.storage;
		write_file(file_path, JSON.stringify(data));
	});

	// For views in entities content, the generated code will be "injected"
 	// directly in place (inside the entity definition where the view is placed).
	views_in_entities_cache.forEach(data => {
		const file_path = data.storage.file_path;
		delete data.storage;
		write_file(file_path, JSON.stringify(data, null, '	'));
	});
}

/**
 * Writes the taxonomy terms cache.
 *
 * @see build_taxonomy_cache()
 */
const cache_taxonomy_terms = () => {
	for (const [vocabulary, terms] of Object.entries(build_taxonomy_cache())) {
		write_file(`static/data/cache/${vocabulary}.json`, JSON.stringify(terms));
	}
}

/**
 * Writes the custom URLs data miner cache.
 */
const cache_channels_urls_data_miner = () => {
	write_file(
		'static/data/cache/channels_urls_data_miner.json',
		JSON.stringify(build_channels_urls_data_miner_cache())
	);
}

module.exports = {
	cache_views_results,
	cache_page_routing_trails,
	cache_taxonomy_terms,
	cache_channels_urls_data_miner
};
