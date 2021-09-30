<script>
	export let cell;
	export let result;
	export let value;

	const renderValue = val => {
		if (!val) {
			return '';
		}
		if (cell?.render?.length) {
			if (cell.render === 'date') {
				return new Date(val).toLocaleDateString('fr', {
					year: "numeric",
					month: "2-digit",
					day: "2-digit"
				});
			}
		}
		return val;
	};
</script>

<div class="{ cell.class || '' }">
	{#if cell.href_from}
		<a class="link-title" href="{ result[cell.href_from] }" target="_blank">
			{ renderValue(value) }
		</a>
	{:else}
		{ renderValue(value) }
	{/if}
</div>

<style>
	.link-title {
		display: inline-block;
		max-width: 42ch;
	}
	.narrow {
		max-width: 10ch;
	}
</style>
