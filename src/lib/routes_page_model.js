/**
 * @file
 * Contains utilities attempting to make SvelteKit / Sapper compatible with
 * something like NetlifyCMS.
 */

/**
 * Normalizes our custom page data model in routes components.
 *
 * @see src/routes/[...slug].svelte
 * @see src/routes/[year([0-9]+)]/[month([0-9]+)]/[slug].svelte
 *
 * @param {Object} pageModel : our custom page data model.
 * @param {Object} page : page object coming from routes' preload().
 * @param {Object} session : session object coming from routes' preload().
 */
export const commonRoutesPreload = async (pageModel, page, session, context) => {
	pageModel.session = session || {};
	pageModel.query = page.query || {};
	pageModel.host = page.host || {};

	// Allow additional arbitrary data to be fetched.
	if ('data' in pageModel && typeof pageModel.data === 'object') {
		const keys = Object.keys(pageModel.data);

		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			const dataFetch = await context.fetch(`/${pageModel.data[key]}`);

			if (dataFetch.status !== 200) {
				this.error(res.status, `The data source '${pageModel.data[key]}' was not found.`);
				return {};
			}

			pageModel.data[key] = await dataFetch.json();
		}
	}
}

/**
 * Updates the "route" writeable store.
 *
 * @see src/stores/route.js
 *
 * @param {Object} pageModel : our custom page data model.
 * @param {Object} currentRoute : data contained in the "route" store.
 * @returns {Object} the new data to replace what's in store.
 */
export const updateRoute = (pageModel, currentRoute) => {
	currentRoute.title = pageModel.title;
	currentRoute.host = pageModel.host;
	currentRoute.path = pageModel.slug;
	currentRoute.lang = pageModel.lang;
	currentRoute.description = pageModel.description;
	currentRoute.image = pageModel.poster_image;
	currentRoute.query = pageModel.query;
	currentRoute.session = pageModel.session;

	// Allow to specify active menu items through the route store.
	// @see src/routes/[year([0-9]+)]/[month([0-9]+)]/[slug].svelte
	// @see src/routes/tag/[slug].svelte
	// @see src/lib/nav.js
	if ('parent_page' in pageModel) {
		currentRoute.parent_page = pageModel.parent_page;
	}
	else if ('parent_page' in currentRoute) {
		delete currentRoute.parent_page;
	}

	// Idem for arbitrary additional data.
	if ('data' in pageModel) {
		currentRoute.data = pageModel.data;
	}
	else if ('data' in currentRoute) {
		delete currentRoute.data;
	}

	return currentRoute;
};
