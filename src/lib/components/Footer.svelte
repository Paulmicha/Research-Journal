<script>
	import footerData from '$content/block/footer.json';
	export let currentPageData;
	const footer = currentPageData.lang in footerData ?
		footerData[currentPageData.lang] :
		footerData[globalData.default_lang];
</script>

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
