<script>
	import { afterUpdate } from 'svelte';
	import { route } from '../stores/route.js';
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';

	export let model;

	/**
	 * Implements Svelte afterUpdate "hook".
	 *
	 * Update current route page title from page data (model) for all descendant
	 * components once the DOM is in sync with data.
	 *
	 * This prevents out-of-sync state when the routing store is updated from the
	 * async preloaded data.
	 */
	afterUpdate(async () => {
		if ('title' in model && 'slug' in model) {
			route.update(existing => {
				existing.title = model.title;
				existing.path = model.slug;
				existing.lang = model.lang;
				existing.description = model.description;
				existing.image = model.poster_image;

				// Allow to specify active menu items through the route store.
				// @see src/routes/[year([0-9]+)]/[month([0-9]+)]/[slug].svelte
				// @see src/routes/tag/[slug].svelte
				// @see src/lib/nav.js
				if ('parent_page' in model) {
					existing.parent_page = model.parent_page;
				}
				else if ('parent_page' in existing) {
					delete existing.parent_page;
				}

				// Idem for arbitrary additional data.
				if ('data' in model) {
					existing.data = model.data;
				}
				else if ('data' in existing) {
					delete existing.data;
				}

				return existing;
			});
		}
	});
</script>

<style>
	main {
		flex-grow: 1;
	}
</style>

<Header {model}></Header>

<main>
	<slot></slot>
</main>

<Footer></Footer>
