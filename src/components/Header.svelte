<script>
	import MenuMain from './MenuMain.svelte';
	import { getContext } from 'svelte';
	import { nav_menu_get_items, nav_breadcrumb_get_items } from '../utils/nav.js';
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

<MenuMain bind:items={menu_main_items} />

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

	{#if menu_subnav_items.length}
		<div class="u-center u-bottom">
			<div class="u-inline-block">
				<div class="o-tgrid o-tgrid--gutter o-tgrid--bottom">
					{#each menu_subnav_items as { path, title, is_active }, i}
						<div class="o-tgrid__item">
							<a href="/{ path }" class="c-subnav-link{ is_active ? ' active' : '' }" rel=prefetch>{ title }</a>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}

</header>
