<script context="module">
	import * as footer_data from '../../static/data/entities/block/footer.json'
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
		text-align: center;
	}
	hr {
		margin-top: var(--space-l);
	}
	.wrap {
		padding: var(--space-s);
		font-size: .8rem;
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
		<a href="{ footer.license_url }" target="_blank">
			<abbr title="{ footer.license_title }">{ footer.license_text }</abbr>
		</a>
		&ndash;
		<a title="Source code" href="https://github.com/Paulmicha/research-journal" target="_blank">
			🐈
		</a>
		is
		<a href="https://www.gnu.org/licenses/lgpl-3.0.html" target="_blank">
			<abbr title="GNU Lesser General Public License">lgpl-3.0</abbr>
		</a>
	</div>
</footer>
