<script>
	import MenuMain from './MenuMain.svelte';
	import { getContext } from 'svelte';
	import { nav_menu_get_items, nav_breadcrumb_get_items } from '../lib/nav.js';
	import { route } from '../stores/route.js';

	export let model;

	const global_data = getContext('global_data');

	let menu_main_items = [];
	let menu_subnav_items = [];
	let breadcrumb_items = [];
	const unsubscribe = route.subscribe(value => {
		menu_main_items = nav_menu_get_items(global_data, value, 0);
		menu_subnav_items = nav_menu_get_items(global_data, value, 1);
		breadcrumb_items = nav_breadcrumb_get_items(global_data, value, model);
	});
</script>

<style>
	.SubNav {
		display: flex;
		justify-content: flex-end;
		align-content: flex-start;
		align-items: stretch;
		margin-top: -1.5rem;
		margin-bottom: 1.5rem;
	}
	.SubNav-link {
		border-bottom: .16rem solid transparent;
		margin: 0 .25rem;
		padding: .4rem .16rem;
		font-size: .66rem;
		font-weight: bold;
		line-height: 1;
		text-transform: uppercase;
		letter-spacing: .16ch;
		text-decoration: none;
	}
	.SubNav-link:focus,
	.SubNav-link:hover,
	.SubNav-link.is-active {
		/* background-color: var(--color-invert-bg);
		color: var(--color-invert-link-on); */
		border-color: var(--color-invert-bg);
	}
</style>

<!-- DEBUG -->
<!-- <pre>Header.svelte : breadcrumb_items = {JSON.stringify(breadcrumb_items, null, 2)}</pre> -->
<!-- <pre>Header.svelte : menu_subnav_items = {JSON.stringify(menu_subnav_items, null, 2)}</pre> -->
<!-- <pre>Header.svelte : model = {JSON.stringify(model, null, 2)}</pre> -->
<!-- <pre>Header.svelte : route = {JSON.stringify(route, null, 2)}</pre> -->
<!-- <pre>Header.svelte : menu_lv1 = {JSON.stringify(menu_lv1, null, 2)}</pre> -->
<!-- <pre>Header.svelte : slug = {JSON.stringify(slug, null, 2)}</pre> -->
<!-- <pre>Header.svelte : $route.trails = {JSON.stringify($route.trails, null, 2)}</pre> -->
<!-- <pre>Header.svelte : $route.trails[slug] = {JSON.stringify($route.trails[slug], null, 2)}</pre> -->
<!-- <pre>Header.svelte : menu_main_items = {JSON.stringify(menu_main_items, null, 2)}</pre> -->

<header>
	<MenuMain bind:items={menu_main_items} />
	{#if menu_subnav_items.length}
		<div class="SubNav">
			{#each menu_subnav_items as { path, title, is_active }, i}
				<a href="/{ path }" class="SubNav-link{ is_active ? ' is-active' : '' }" rel=prefetch>{ title }</a>
			{/each}
		</div>
	{/if}
	{#if breadcrumb_items.length}
		<nav class="Breadcrumb">
			{#each breadcrumb_items as { path, title }, i}
				{#if i > 0}
					<span class="Breadcrumb-sep" aria-hidden="true"></span>
				{/if}
				<span class="Breadcrumb-item">
					<a href="/{ path }" rel=prefetch>
						{ title }
					</a>
				</span>
			{/each}
			<span class="Breadcrumb-item">
				{ model.title }
			</span>
		</nav>
	{/if}
	<h1>{ model.title }</h1>
</header>
