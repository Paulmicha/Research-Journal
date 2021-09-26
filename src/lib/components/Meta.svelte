<script>
	import globalData from '$content/config/global.json';
	export let currentPageData;
</script>

<svelte:head>
	<!-- This website is an experiment, do not index in public search engines. -->
	<meta name="robots" content="noindex">

	<title>{ currentPageData.title + ((currentPageData.title != globalData.site_name) ? ' | ' + globalData.site_name : '') }</title>
	<meta property="og:title" content="{ currentPageData.title }">
	<meta property="og:description" content="{ currentPageData.description }">
	<!-- TODO fallback image to create : -->
	<meta property="og:image" content="{ 'process.env.BASE_URL' + currentPageData.image ? currentPageData.image : '/theme/logo-1200x630.png' }">
	<meta property="og:url" content="{ 'process.env.BASE_URL' + currentPageData.path ? currentPageData.path : '' }">
	<meta name="twitter:card" content="{ currentPageData.twitter_card ? currentPageData.twitter_card : 'summary_large_image' }">
	<meta property="og:site_name" content="{ globalData.site_name }">
	<meta name="twitter:image:alt" content="{ currentPageData.image_alt ? currentPageData.image_alt : globalData.site_name }">
</svelte:head>

<!-- DEBUG -->
<!-- <pre>Meta.svelte : currentPageData = {JSON.stringify(currentPageData, null, 2)}</pre> -->
