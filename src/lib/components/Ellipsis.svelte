<script>
	export let text = "Demo";
	export let valign = "baseline";

	const init = e => {
		if (e.offsetWidth < e.scrollWidth) {
			e.setAttribute('title', text);
		}
	};
</script>

<span use:init class="fx-ellipsis" style="--valign:{ valign }">
	{ text }
</span>

<style>
	span {
		vertical-align: var(--valign);
	}
</style>
