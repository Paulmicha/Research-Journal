<script>
	import Text from '../Text.svelte';
	export let text = '';
</script>

<style>
	p {
		margin-bottom: var(--space);
	}
</style>

<p>
	<Text {text} dropcap={true} dropcap_variant="u-dropcap--l" />
</p>
