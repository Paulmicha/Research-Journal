import { writable } from 'svelte/store';
import * as cached_trails from '../../static/data/cache/page_routing_trails.json';

export const route = writable({
	"session": {},
	"query": {},
	"path": "",
	"lang": "en",
	"title": "",
	"trails": cached_trails.default
});

// TODO also check if route.data, if present, has the same keys ?
const routeKeysChangedCheck = ['title', 'path', 'lang', 'description'];

/**
 * Verifies if the "route" store needs to be updated.
 *
 * @see updateRoute()
 *
 * @param {Object} pageModel : page data coming from routes' preload().
 * @param {Object} currentRoute : data contained in the "route" store.
 * @returns {Boolean} true if the store needs to be updated.
 */
// export const routeHasChanged = (pageModel, currentRoute) => {
// 	for (let i = 0; i < routeKeysChangedCheck.length; i++) {
// 		const key = routeKeysChangedCheck[i];
// 		if (!(key in pageModel) || currentRoute[key] != pageModel[key]) {
// 			return true;
// 		}
// 	}
// 	return false;
// };
export const routeHasChanged = pageModel => {
	for (let i = 0; i < routeKeysChangedCheck.length; i++) {
		const key = routeKeysChangedCheck[i];
		if (!(key in pageModel) || route[key] != pageModel[key]) {
			return true;
		}
	}
	return false;
};

/**
 * Only updates the "route" store if it needs to be updated.
 *
 * @param {Object} routeStore : the "route" store.
 * @param {Object} pageModel : page data coming from routes' preload().
 */
// export const updateRouteIfNeeded = (routeStore, pageModel) => {
// 	if (routeHasChanged(pageModel, routeStore)) {
// 		routeStore.update(existing => updateRoute(pageModel, existing));
// 	}
// };
export const updateRouteIfNeeded = pageModel => {
	if (routeHasChanged(pageModel)) {
		route.update(existing => updateRoute(pageModel, existing));
	}
};
