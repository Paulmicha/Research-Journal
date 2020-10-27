<script context="module">
	import * as global_data from '../entities/config/global.json';
	import * as translation_data from '../entities/config/translation.json';
	import * as menu_main from '../entities/menu/main.json'
</script>

<script>
	import { setContext } from 'svelte';
	import Meta from '../components/Meta.svelte';

	const globals = global_data.default;
	globals.translations = translation_data.default;
	globals.menu_main = menu_main.default;

	setContext('global_data', globals);
</script>

<style>
	/*
	.wrapper {
		display: grid;
		grid-template-columns:
			1fr
			min(65ch, 100%)
			1fr;
	}
	.wrapper > * {
		grid-column: 2;
	}
	.full-bleed {
		width: 100%;
		grid-column: 1 / 4;
	}
	*/
	.wrapper {
		display: block;
		margin-left: auto;
		margin-right: auto;
		width: 80ch;
		max-width: 100%;
	}
</style>

<Meta></Meta>

<div class="wrapper">
	<slot></slot>
</div>
