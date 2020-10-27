<script context="module">
	import * as global_data from '../../static/data/entities/config/global.json';
	import * as translation_data from '../../static/data/entities/config/translation.json';
	import * as menu_main from '../../static/data/entities/menu/main.json'
</script>

<script>
	import { setContext } from 'svelte';
	import Meta from '../components/Meta.svelte';

	const globals = global_data.default;
	globals.translations = translation_data.default;
	globals.menu_main = menu_main.default;

	setContext('global_data', globals);
</script>

<Meta></Meta>

<slot></slot>
