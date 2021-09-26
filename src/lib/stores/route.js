import { writable } from 'svelte/store';

export const route = writable({
	"lang": "en",
	"title": "",
	"description": ""
});
