<script context="module">
	import * as global_data from '../../static/data/entities/config/global.json';
	import * as translation_data from '../../static/data/entities/config/translation.json';
	import * as menu_main from '../../static/data/entities/menu/main.json'
</script>

<script>
	import { setContext } from 'svelte';
	import { stores } from '@sapper/app';
	import { onMount } from 'svelte';
	import Meta from '../components/Meta.svelte';

	// Keep scrollbar width up to date to avoid horizontal scrollbars.
	let d = null;
	const { page } = stores();
	const setDocumentScrollbarWidthCssVar = () => d && d.documentElement.style.setProperty(
		'--scrollbar-width',
		(window.innerWidth - d.documentElement.clientWidth) + "px"
	);
	page.subscribe(setDocumentScrollbarWidthCssVar);
	onMount(() => {
		d = document;
		setDocumentScrollbarWidthCssVar();
	});

	// Make all components inherit globals via Svelte context API.
	const globals = global_data.default;
	globals.translations = translation_data.default;
	globals.menu_main = menu_main.default;
	setContext('global_data', globals);
</script>

<!-- TODO deal with non-navigation window height changes -->
<!-- on:resize={setDocumentScrollbarWidthCssVar} -->
<svelte:window
	on:load={setDocumentScrollbarWidthCssVar}
/>
<Meta></Meta>
<slot></slot>
