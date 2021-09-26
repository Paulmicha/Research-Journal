<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { setContext } from 'svelte';

	// Keep scrollbar width up to date in CSS to avoid horizontal scrollbar. This
	// is necessary because the layout is narrow and centered by default, and the
	// wider areas "bleed out". Because 100vw does not take scrollbars' width into
	// account, in order for these areas to reach the page sides exactly, we need
	// to keep the scrollbars width value in a CSS variable, and keep it at 0 when
	// there is no scrollbar (using setContext for exposing this for components
	// which might make the page height change, thus making the scrollbar appear
	// or disappear).
	let d = null;
	let timeOut = null;

	const updateCssWidth = () => d && d.documentElement.style.setProperty(
		'--scrollbar-width',
		(window.innerWidth - d.documentElement.clientWidth) + "px"
	);

	const throttle = () => {
		if (timeOut) {
  		clearTimeout(timeOut);
		}
  	timeOut = setTimeout(updateCssWidth, 200);
	};

	page.subscribe(updateCssWidth);

	onMount(() => {
		d = document;
		updateCssWidth();
	});

	setContext('updateCssWidth', updateCssWidth);
</script>

<svelte:window on:resize={ throttle } />

<slot />
