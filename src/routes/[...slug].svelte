<script context="module">

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

		// Allow additional arbitrary data to be fetched.
		if ('data' in model && typeof model.data === 'object') {
			const keys = Object.keys(model.data);

			for (let i = 0; i < keys.length; i++) {
				const key = keys[i];
				const dataFetch = await this.fetch(`/${model.data[key]}`);

				if (dataFetch.status !== 200) {
					this.error(res.status, `The data source '${model.data[key]}' was not found.`);
					return {};
				}

				model.data[key] = await dataFetch.json();
			}
		}

		return { model };
	}
</script>

<script>
	import LayoutContentPage from '../components/LayoutContentPage.svelte';
	// placeholder://src/preprocess.js
	export let model;
</script>

<!-- DEBUG -->
<!-- <pre>[slug].svelte : slug = {JSON.stringify(model.slug, null, 2)}</pre> -->
<!-- <pre>[slug].svelte : model = {JSON.stringify(model, null, 2)}</pre> -->

<LayoutContentPage {model}>
	{#each model.content as { c, props }}
		<!-- placeholder://src/preprocess.js -->
	{/each}
</LayoutContentPage>
