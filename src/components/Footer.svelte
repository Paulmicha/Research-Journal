<script context="module">
	import * as footer_data from '../entities/block/footer.json'
</script>

<script>
	import { getContext } from 'svelte';
	import { route } from '../stores/route.js';

	const global_data = getContext('global_data');
	const footer = $route.lang in footer_data ?
		footer_data[$route.lang] :
		footer_data[global_data.default_lang];
</script>

<footer>
	<hr>
	<a href="{ footer.license_url }">
		<abbr title="{ footer.license_title }">{ footer.license_text }</abbr>
	</a>
</footer>
