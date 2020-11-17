<script>
	import Text from '../Text.svelte';
	export let text = '';
</script>

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

<p>
	<Text {text} dropcap={true} dropcap_variant="u-dropcap--l" />
</p>
