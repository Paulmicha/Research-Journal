<script context="module">
	import * as footer_data from '../../data/entities/block/footer.json'
</script>

<script>
	import { getContext } from 'svelte';
	import { route } from '../stores/route.js';

	const global_data = getContext('global_data');
	const footer = $route.lang in footer_data ?
		footer_data[$route.lang] :
		footer_data[global_data.default_lang];
</script>

<style>
  footer {
		padding: .5rem 0;
		text-align: center;
	}
	hr {
		margin-bottom: .33rem;
	}
	.wrap {
		padding: .5rem;
	}
	a {
		text-transform: uppercase;
		text-decoration: none;
	}
</style>

<footer>
	<hr>
	<div class="wrap">
		{ footer.license_prefix }
		<a href="{ footer.license_url }">
			<abbr title="{ footer.license_title }">{ footer.license_text }</abbr>
		</a>
	</div>
</footer>
