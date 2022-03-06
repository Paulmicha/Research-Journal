<script context="module">
	// Make sure we only assign unique ids to different pagers (for anchor links).
	const renderedPagerIds = [];
</script>

<script>
	import { getContext } from 'svelte';
	// import { page } from '$app/stores';
	import { paginateView } from '$lib/view';
	import { appIsBusy } from '$lib/stores/globalState.js';

	const view = getContext('view');

	// [minor] Deal with main layout width adjustments when scrollbar (dis)appears.
	// @see src/routes/__layout.svelte
	const updateCssWidth = getContext('updateCssWidth');

	// Heavy operation -> show loading feedback -> delay between stores updates.
	let timeOut = null;

	// Unique ID for current pager (there can be several for the same view).
	let pagerId = "pager-" + $view.id;
	while (renderedPagerIds.includes(pagerId)) {
		pagerId += '-bis';
	}
	renderedPagerIds.push(pagerId);

	// Keep pager links in sync with pager state.
	// TODO (wip) Sveltekit static adapter cannot build query args.
	// Error: Cannot access query on a page with prerendering enabled
	// let firstUrl = $page.url.pathname;
	// let prevUrl = $page.url.pathname;
	// let nextUrl = $page.url.pathname;
	// let lastUrl = $page.url.pathname;
	// view.subscribe(o => {
	// 	// Preserve any other query args (otherwise the pager links would loose them).
	// 	if ($page.url.searchParams.toString().length) {
	// 		firstUrl = $page.url.pathname + "?" + $page.url.searchParams.toString();
	// 		prevUrl = $page.url.pathname + "?" + $page.url.searchParams.toString();
	// 		nextUrl = $page.url.pathname + "?" + $page.url.searchParams.toString();
	// 	}
	// 	if (o.pager.prev > 0) {
	// 		$page.url.searchParams.set('p' + o.id, o.pager.prev);
	// 		prevUrl = $page.url.pathname + "?" + $page.url.searchParams.toString();
	// 	}
	// 	$page.url.searchParams.set('p' + o.id, o.pager.next);
	// 	nextUrl = $page.url.pathname + "?" + $page.url.searchParams.toString();
	// 	$page.url.searchParams.set('p' + o.id, o.pager.last_page);
	// 	lastUrl = $page.url.pathname + "?" + $page.url.searchParams.toString();
	// });

	/**
	 * Applies new current page.
	 *
	 * @param {Integer} n the new page number.
	 */
	const paginate = n => {
		appIsBusy.set(true);
		if (timeOut) {
			clearTimeout(timeOut);
		}

		const callback = n => {
			view.update(o => {
				paginateView(o, n);
				return o;
			});

			appIsBusy.set(false);
			setTimeout(updateCssWidth, 100);
		};

		timeOut = setTimeout(callback, 150, n);
	};
</script>

<ul class="pager" id={ pagerId }>
	<li>
		<!-- <a
			class:disabled={ $view.pager.prev_is_disabled }
			class="btn btn--s"
			href={ firstUrl }
			title="Go to first page"
			on:click|preventDefault={ () => paginate(0) }
		>
			«
		</a> -->
		<button
			class:disabled={ $view.pager.prev_is_disabled }
			class="btn btn--s"
			title="Go to first page"
			on:click|preventDefault={ () => paginate(0) }
		>
			«
		</button>
	</li>
	<li>
		<!-- <a
			class:disabled={ $view.pager.prev_is_disabled }
			class="btn btn--s"
			href={ prevUrl }
			title="Go to previous page : { $view.pager.prev + 1 }"
			on:click|preventDefault={ () => paginate($view.pager.prev) }
		>
			←
		</a> -->
		<button
			class:disabled={ $view.pager.prev_is_disabled }
			class="btn btn--s"
			title="Go to previous page : { $view.pager.prev + 1 }"
			on:click|preventDefault={ () => paginate($view.pager.prev) }
		>
			←
		</button>
	</li>
	<li class="u-fs-s">
		Page { $view.pager.current_page + 1 } / { $view.pager.last_page + 1 }
	</li>
	<li>
		<!-- <a
			class:disabled={ $view.pager.next_is_disabled }
			class="btn btn--s"
			href={ nextUrl }
			title="{ $view.pager.next_is_disabled ? '' : "Go to next page : " + ($view.pager.next + 1) }"
			on:click|preventDefault={ () => paginate($view.pager.next) }
		>
			→
		</a> -->
		<button
			class:disabled={ $view.pager.next_is_disabled }
			class="btn btn--s"
			title="Go to next page : { $view.pager.next + 1 }"
			on:click|preventDefault={ () => paginate($view.pager.next) }
		>
			→
		</button>
	</li>
	<li>
		<!-- <a
			class:disabled={ $view.pager.next_is_disabled }
			class="btn btn--s"
			href={ lastUrl }
			title={ $view.pager.next_is_disabled ? '' : "Go to last page" }
			on:click|preventDefault={ () => paginate($view.pager.last_page) }
		>
			»
		</a> -->
		<button
			class:disabled={ $view.pager.next_is_disabled }
			class="btn btn--s"
			title="Go to last page"
			on:click|preventDefault={ () => paginate($view.pager.last_page) }
		>
			»
		</button>
	</li>
</ul>

<style>
	.pager {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: var(--space-xs) 0;
		list-style: none;
	}
	.pager > * + * {
		margin-left: var(--space-xs);
	}
	.btn.disabled {
		opacity: .33;
		cursor: initial;
	}
</style>
