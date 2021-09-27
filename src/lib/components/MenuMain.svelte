<script>
	import { navigating, page } from '$app/stores';
	import { appIsBusy } from '$lib/stores/globalState.js';
	import globalData from '$content/config/global.json';
	import menuMainData from '$content/menu/main.json';
	import LoadingSpinner from './LoadingSpinner.svelte';

	export let currentPageData;

	const items = [];

	let localizedMenuItems = currentPageData.lang in menuMainData ?
		menuMainData[currentPageData.lang] :
		menuMainData[globalData.default_lang];

	localizedMenuItems.forEach(item => {
		item.isActive = '/' + item.path === $page.path;
		items.push(item);
	});
</script>

<!-- DEBUG -->
<!-- <pre>MenuMain.svelte : $page = {JSON.stringify($page, null, 2)}</pre> -->
<!-- <pre>MenuMain.svelte : currentPageData = {JSON.stringify(currentPageData, null, 2)}</pre> -->
<!-- <pre>MenuMain.svelte : items = {JSON.stringify(items, null, 2)}</pre> -->

<div class="wrap full-vw full-vw--padded" class:is-loading={ $appIsBusy || $navigating }>
	<div class="inner-wrap">
		<a class="logo" href="/">
			<img src="/logo.svg" alt="Experimental research journal logo" />
			{#if $appIsBusy || $navigating}
				<LoadingSpinner size="75%" border=".33em" voffset="-.16em" />
			{/if}
		</a>
		<nav class="MenuMain">
			{#each items as { title, path, isActive }, i}
				<div class="MenuMain-item{ isActive ? ' is-active' : '' }">
					{#if isActive}
						<span class="MenuMain-deco"></span>
					{/if}
					<a
						class:is-active={ isActive }
						class="MenuMain-link u-faux-small-caps"
						rel=prefetch
						href="/{ path }"
						aria-current={ isActive ? "page" : undefined }
					>
						{ title }
					</a>
				</div>
			{/each}
		</nav>
	</div>
</div>

<style>
	.wrap {
		margin-bottom: 1.5rem;
		padding-top: .25rem;
		padding-bottom: .25rem;
		background-color: var(--color-invert-bg);
	}
	@keyframes bg-anim {
		0% { background-position: 0% 50% }
    50% { background-position: 100% 50% }
    100% { background-position: 0% 50% }
	}
	.wrap.is-loading {
		position: relative;
	}
	.wrap.is-loading::after {
		content: '';
		position: absolute;
		bottom: calc(var(--space-s) * -1);
		left: 0;
		right: 0;
		background: linear-gradient(
			to right,
			rgb(76, 217, 105),
			rgb(90, 200, 250),
			rgb(0, 132, 255),
			rgb(52, 170, 220),
			rgb(88, 86, 217),
			rgb(255, 45, 83)
		);
		background-size: 400% 400%;
		width: 100%;
		height: var(--space-s);
		animation: bg-anim 3s ease-in-out infinite;
	}
	.inner-wrap {
		display: flex;
		align-items: center;
		width: 100%;
	}
	.logo {
		position: relative;
		display: block;
		line-height: 1;
		width: 1.66rem;
		text-decoration: none;
	}
	.MenuMain {
		display: flex;
		justify-content: space-evenly;
		width: 100%;
	}
	.MenuMain-item {
		padding: 0 var(--space-s);
	}
	.MenuMain-link {
		display: inline-block;
		vertical-align: middle;
		line-height: 1;
		color: var(--color-invert-link-off);
		font-weight: bold;
		text-decoration: none;
	}
	.MenuMain-link:focus,
	.MenuMain-link:hover,
	.MenuMain-link.is-active {
		color: var(--color-invert-link-on);
	}
</style>
