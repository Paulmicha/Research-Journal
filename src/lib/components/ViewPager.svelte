<script context="module">
	// Make sure we only assign unique ids to different pagers (for anchor links).
	const renderedPagerIds = [];
</script>

<script>
	import { getContext } from 'svelte';
	import { page } from '$app/stores';

	const baseUrl = $page.path;
	const view = getContext('view');
	const urlParam = 'p' + $view.id;

	console.log("urlParam in pager :");
	console.log(urlParam);

	let lastPage = $view.pager?.last_page;
	let currentPage = $view.pager?.current_page;

	let firstUrl = baseUrl;
	let lastUrl = baseUrl;

	let prev = -1;
	let prevIsDisabled = '';
	let prevUrl = baseUrl;
	let next = 1;
	let nextIsDisabled = '';
	let nextUrl = baseUrl;

	let pagerId = "pager-" + $view.id;
	while (renderedPagerIds.includes(pagerId)) {
		pagerId += '-bis';
	}
	renderedPagerIds.push(pagerId);

	if (currentPage > 0) {
		prev = currentPage - 1;
		next = currentPage + 1;
		$page.query.delete(urlParam);
	}

	// Preserve any other query args (otherwise the pager links would loose them).
	// TODO in Netlify this won't work -> deprecate Netlify (won't fix).
	if ($page.query.toString().length) {
		prevUrl = baseUrl + "?" + $page.query.toString();
		nextUrl = baseUrl + "?" + $page.query.toString();
	}

	if (prev < 0) {
		prevIsDisabled = 'disabled';
	} else if (prev > 0) {
		$page.query.set(urlParam, prev);
		prevUrl = baseUrl + "?" + $page.query.toString();
	}

	if (next >= lastPage) {
		nextIsDisabled = 'disabled';
	} else {
		$page.query.set(urlParam, next);
		nextUrl = baseUrl + "?" + $page.query.toString();
	}

	// First + Last links.
	$page.query.delete(urlParam);
	if ($page.query.toString().length) {
		firstUrl = baseUrl + "?" + $page.query.toString();
	}
	else {
		firstUrl = baseUrl;
	}
	if (nextIsDisabled === 'disabled') {
		lastUrl = baseUrl;
	}
	else {
		$page.query.set(urlParam, lastPage - 1);
		lastUrl = baseUrl + "?" + $page.query.toString();
	}
</script>

<ul class="pager" id={ pagerId }>
	<li class={ prevIsDisabled }>
		<!-- <a href={ firstUrl + '#' + pagerId } title="First">«</a> -->
		<a href={ firstUrl } title="First">«</a>
	</li>
	<li class={ prevIsDisabled }>
		<!-- <a href={ prevUrl + '#' + pagerId } title="Previous">←</a> -->
		<a href={ prevUrl } title="Previous">←</a>
	</li>
	<li class="u-fs-s">Page { currentPage + 1 } / { lastPage }</li>
	<li class={ nextIsDisabled }>
		<!-- <a href={ nextUrl + '#' + pagerId } title="Next">→</a> -->
		<a href={ nextUrl } title="Next">→</a>
	</li>
	<li class={ nextIsDisabled }>
		<!-- <a href={ lastUrl + '#' + pagerId } title="Last">»</a> -->
		<a href={ lastUrl } title="Last">»</a>
	</li>
</ul>

<style>
	.pager {
		display: flex;
		justify-content: center;
		list-style: none;
	}
	a {
		padding: var(--space-s) var(--space);
	}
</style>
