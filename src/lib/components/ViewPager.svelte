<script context="module">
	// Make sure we only assign unique ids to different pagers (for anchor links).
	const renderedPagerIds = [];
</script>

<script>
	import { getContext } from 'svelte';
	import { page } from '$app/stores';

	const baseUrl = $page.path;
	const view = getContext('view');

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
		$page.query.delete('p' + $view.id);
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
		$page.query.set('p' + $view.id, prev);
		prevUrl = baseUrl + "?" + $page.query.toString();
	}

	if (next >= lastPage) {
		nextIsDisabled = 'disabled';
	} else {
		$page.query.set('p' + $view.id, next);
		nextUrl = baseUrl + "?" + $page.query.toString();
	}

	// First + Last links.
	$page.query.delete('p' + $view.id);
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
		$page.query.set('p' + $view.id, lastPage - 1);
		lastUrl = baseUrl + "?" + $page.query.toString();
	}
</script>

<ul class="pager" id={ pagerId }>
	<li class={ prevIsDisabled }>
		<a href={ firstUrl + '#' + pagerId } title="First">«</a>
	</li>
	<li class={ prevIsDisabled }>
		<a href={ prevUrl + '#' + pagerId } title="Previous">←</a>
	</li>
	<li>Page { currentPage + 1 } / { lastPage }</li>
	<li class={ nextIsDisabled }>
		<a href={ nextUrl + '#' + pagerId } title="Next">→</a>
	</li>
	<li class={ nextIsDisabled }>
		<a href={ lastUrl + '#' + pagerId } title="Last">»</a>
	</li>
</ul>

<style>
	.pager {
		display: flex;
	}
</style>
