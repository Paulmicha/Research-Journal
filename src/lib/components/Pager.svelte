<script context="module">
	// Make sure we only assign unique ids to different pagers (for anchor links).
	const renderedPagerIds = [];
</script>

<script>
	// TODO pager_data = [
 	//   'id' => id,
 	//   'nb_per_page' => nb_per_page,
 	//   'current_page' => current_page,
 	//   'last_page' => last_page,
 	//   'total_results_nb' => total_results_nb,
 	// ]

	export let id = 0;

	const baseUrl = '/';

	let pagerId = "pager-" + id;
	while (renderedPagerIds.includes(pagerId)) {
		pagerId += '-bis';
	}
	renderedPagerIds.push(pagerId);

	// Prev + Next links.
	prev = -1;
	prevIsDisabled = '';
	prev_url = baseUrl;
	next = 1;
	nextIsDisabled = '';
	next_url = baseUrl;

	if (isset(get_args["pid"])) {
		prev = get_args["pid"] - 1;
		next = get_args["pid"] + 1;
		unset(get_args["pid"]);
	}

	if (!empty(get_args)) {
		prev_url = baseUrl .'?'. http_build_query(get_args);
		next_url = baseUrl .'?'. http_build_query(get_args);
	}

	if (prev < 0) {
		prevIsDisabled = 'disabled';
	}
	elseif (prev > 0) {
		get_args["pid"] = prev;
		prev_url = baseUrl .'?'. http_build_query(get_args);
	}

	if (next >= last_page) {
		nextIsDisabled = 'disabled';
	}
	else {
		get_args["pid"] = next;
		next_url = baseUrl .'?'. http_build_query(get_args);
	}

	// First + Last links.
	unset(get_args["pid"]);
	if (!empty(get_args)) {
		first_url = baseUrl .'?'. http_build_query(get_args);
	}
	else {
		first_url = baseUrl;
	}
	if (nextIsDisabled == 'disabled') {
		last_url = baseUrl;
	}
	else {
		get_args["pid"] = last_page - 1;
		last_url = baseUrl .'?'. http_build_query(get_args);
	}

	current_page_displayed = current_page + 1;
	last_page_displayed = last_page;
</script>

<ul class="pager" id="pagerId">
	<li class="prevIsDisabled"><a href="first_url#pagerId" title="First">«</a></li>
	<li class="prevIsDisabled"><a href="prev_url#pagerId" title="Previous">←</a></li>
	<li>Page current_page_displayed / last_page_displayed </li>
	<li class="nextIsDisabled"><a href="next_url#pagerId" title="Next">→</a></li>
	<li class="nextIsDisabled"><a href="last_url#pagerId" title="Last">»</a></li>
</ul>

<style>
</style>
