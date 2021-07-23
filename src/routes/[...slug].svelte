<script context="module">
	import { commonRoutesPreload } from '../lib/routes_page_model.js';

	/**
	 * Implements Sapper route preload "hook".
	 *
	 * Provides page data ("model").
	 *
	 * @param page : object containing `{ path, params, query }`.
	 * @param session : used for credentialled requests.
	 * @return object : page data (model).
	 */
	export async function preload(page, session) {
		const { slug } = page.params;
		const pageModelFetch = await this.fetch(`/data/entities/content/page/${slug.join('/')}.json`);

		if (pageModelFetch.status !== 200) {
			this.error(res.status, `The page '${slug.join('/')}' was not found.`);
			return {};
		}

		const model = await pageModelFetch.json();
		model.slug = slug.join('/');

		await commonRoutesPreload(model, page, session, this);
		return { model };
	}
</script>

<script>
	import { route } from '../stores/route.js';
	import { updateRoute } from '../lib/routes_page_model.js';
	import LayoutContentPage from '../components/LayoutContentPage.svelte';
	// placeholder://src/preprocess.js

	export let model;

	$: route.update(existing => updateRoute(model, existing));
</script>

<!-- DEBUG -->
<!-- <pre>[slug].svelte : slug = {JSON.stringify(model.slug, null, 2)}</pre> -->
<!-- <pre>[slug].svelte : model = {JSON.stringify(model, null, 2)}</pre> -->

<LayoutContentPage {model}>
	{#each model.content as { c, props }}
		<!-- placeholder://src/preprocess.js -->
	{/each}
</LayoutContentPage>
