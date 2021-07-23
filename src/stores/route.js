import { writable } from 'svelte/store';
import * as cached_trails from '../../static/data/cache/page_routing_trails.json';

export const route = writable({
	"session": {},
	"query": {},
	"host": "",
	"path": "",
	"lang": "en",
	"title": "",
	"trails": cached_trails.default
});
