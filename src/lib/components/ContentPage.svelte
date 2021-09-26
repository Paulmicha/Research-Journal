<script>
	import Meta from '$lib/components/Meta.svelte';
	import MenuMain from '$lib/components/MenuMain.svelte';
	import Footer from '$lib/components/Footer.svelte';
	export let currentPageData;
</script>

<Meta { currentPageData } />

<header>
	<MenuMain { currentPageData } />
	<h1>{ currentPageData.title }</h1>
</header>

<main>
	<slot />
</main>

<Footer { currentPageData } />
