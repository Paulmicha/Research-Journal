<script>
	export let dismiss;
	export let exclusions = [];

	let componentInstanceElement;

	// Based on https://github.com/joeattardi/svelte-click-outside
	const isExcluded = target => {
		let parent = target;
		while (parent) {
			if (exclusions.includes(parent) || parent === componentInstanceElement) {
				return true;
			}
			parent = parent.parentNode;
		}
		return false;
  }
</script>

<svelte:body on:click={ e => { !isExcluded(e.target) && dismiss() }} />
<svelte:window on:keydown={ e => { e.key === "Escape" && dismiss() }} />

<aside bind:this={ componentInstanceElement }>
	<slot />
</aside>
