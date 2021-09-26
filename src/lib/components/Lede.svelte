<script>
	import Text from '$lib/components/Text.svelte';
	export let text = '';
</script>

<p>
	<Text { text } dropcap={ true } dropcap_variant="u-dropcap--l" />
</p>

<style>
	p {
		margin-top: var(--space);
		margin-bottom: var(--space);
	}
	p::after {
		content: "";
		display: table;
		clear: both;
	}
</style>
