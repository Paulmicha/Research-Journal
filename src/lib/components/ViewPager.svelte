<script context="module">
	// Make sure we only assign unique ids to different pagers (for anchor links).
	const renderedPagerIds = [];
</script>

<script>
	// import { getContext, onMount } from 'svelte';
	import { getContext } from 'svelte';
	// import { page } from '$app/stores';
	import { paginateView } from '$lib/view';
	import { appIsBusy } from '$lib/stores/globalState.js';

	const view = getContext('view');
	// const urlParam = 'p' + $view.id;

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

	/**
	 * Applies new current page.
	 *
	 * @param {Integer} n the new page number.
	 */
	const paginate = n => {
		// Debug.
		console.log("paginate to " + n);

		appIsBusy.set(true);
		if (timeOut) {
			clearTimeout(timeOut);
		}

		const callback = n => {
			console.log("begin setting page to " + n);
			view.update(o => {
				// let firstUrl = $page.path;
				// let lastUrl = $page.path;

				console.log("update to " + n);

				let prev = -1;
				let prevIsDisabled = false;
				// let prevUrl = $page.path;
				let next = 1;
				let nextIsDisabled = false;
				// let nextUrl = $page.path;

				// Adjust next / prev page numbers.
				if (n > 0) {
					prev = n - 1;
					next = n + 1;
					// $page.query.delete(urlParam);
				}

				console.log("next is " + next);

				// Preserve any other query args (otherwise the pager links would loose them).
				// if ($page.query.toString().length) {
				// 	prevUrl = $page.path + "?" + $page.query.toString();
				// 	nextUrl = $page.path + "?" + $page.query.toString();
				// }

				if (prev < 0) {
					prevIsDisabled = true;
				} else if (prev > 0) {
					// $page.query.set(urlParam, prev);
					// prevUrl = $page.path + "?" + $page.query.toString();
				}

				if (next >= $view.pager.last_page) {
					nextIsDisabled = true;
				} else {
					// $page.query.set(urlParam, next);
					// nextUrl = $page.path + "?" + $page.query.toString();
				}

				// First + Last links.
				// $page.query.delete(urlParam);
				// if ($page.query.toString().length) {
				// 	firstUrl = $page.path + "?" + $page.query.toString();
				// }
				// else {
				// 	firstUrl = $page.path;
				// }
				// if (nextIsDisabled) {
				// 	lastUrl = $page.path;
				// }
				// else {
				// 	$page.query.set(urlParam, $view.pager.last_page - 1);
				// 	lastUrl = $page.path + "?" + $page.query.toString();
				// }

				// o.first_url = firstUrl;
				o.prev = prev;
				// o.prev_url = prevUrl;
				o.prev_is_disabled = prevIsDisabled;
				o.next = next;
				// o.next_url = nextUrl;
				o.next_is_disabled = nextIsDisabled;
				// o.last_url = lastUrl;

				paginateView(o, n);

				return o;
			});

			appIsBusy.set(false);
			setTimeout(updateCssWidth, 100);
		};

		timeOut = setTimeout(callback, 150, n);
	};

	// Debug.
	view.subscribe(o => {
		console.log("current page was set to " + o.pager.current_page);
		console.log("-> new pager state :");
		console.log(o.pager);
	});

	// onMount(() => paginate(pagerPos));

</script>

<ul class="pager" id={ pagerId }>
	<li>
		<!-- <a
			class:disabled={ $view.pager.prev_is_disabled }
			class="btn btn--s"
			href={ $view.pager.first_url }
			title="First"
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
			href={ $view.pager.prev_url }
			title="Previous"
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
		Page { $view.pager.current_page + 1 } / { $view.pager.last_page }
	</li>
	<li>
		<!-- <a
			class:disabled={ $view.pager.next_is_disabled }
			class="btn btn--s"
			href={ $view.pager.next_url }
			title="Next"
			on:click|preventDefault={ () => paginate($view.pager.next) }
		>
			→ ({ $view.pager.next })
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
			href={ $view.pager.last_url }
			title="Last"
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
		list-style: none;
	}
	.pager > * + * {
		margin-left: var(--space-xs);
	}
</style>
