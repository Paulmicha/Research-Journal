/**
 * @file
 * (Re)builds the local file-based cache & other dynamic files.
 */

const { cache_page_routing_trails, cache_views_results, cache_taxonomy_terms } = require('../data/cache');

cache_page_routing_trails();
cache_views_results();
cache_taxonomy_terms();
