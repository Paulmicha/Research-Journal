import { writable } from 'svelte/store';
import * as cached_trails from '../../data/cache/page_routing_trails.json';

export const route = writable({
	"path": "",
	"lang": "en",
	"title": "",
	"trails": cached_trails.default
});
