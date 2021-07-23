<script context="module">
	import { commonRoutesPreload } from '../../../lib/routes_page_model.js';

	/**
	 * Implements Sapper route preload "hook".
	 *
	 * Provides blog post data ("model").
	 *
	 * @param page : object containing `{ path, params, query }`.
	 * @param session : used for credentialled requests.
	 * @return object : page data (model).
	 *
	 * @see src/routes/[year([0-9]+)]/[month([0-9]+)]/[slug].json.js
	 */
	export async function preload(page, session) {
		let {year, month, slug} = page.params;
		const res = await this.fetch(`/data/entities/content/doodle/${year}/${month}/${slug}.json`);

		if (res.status !== 200) {
			this.error(res.status, `The path ${year}/${month}/${slug} was not found`);
			return {};
		}

		const model = await res.json();
		model.slug = `${year}/${month}/${slug}`;

		// Specific nav state for blog posts.
		// @see src/components/LayoutContentPage.svelte
		// @see src/lib/nav.js
		model.parent_page = 'doodles';

		await commonRoutesPreload(model, page, session, this);
		return { model };
	}
</script>

<script>
	import { route } from '../../../stores/route.js';
	import { updateRoute } from '../../../lib/routes_page_model.js';
	import LayoutContentPage from '../../../components/LayoutContentPage.svelte';
	// placeholder://src/preprocess.js

	export let model;

	$: route.update(existing => updateRoute(model, existing));
</script>

<LayoutContentPage {model}>
	{#each model.content as { c, props }}
		<!-- placeholder://src/preprocess.js -->
	{/each}
</LayoutContentPage>
