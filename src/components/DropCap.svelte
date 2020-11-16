<script>
	export let text = "Demo";
	export let variant = "u-dropcap";
	// export let variant = "u-dropcap--l";

	const id = Math.random()
		.toString(36)
		.substr(2, 9);
	const first_letter = text.substr(0, 1);
	const remaining_text = text.substr(1);
</script>

<style>
	.u-dropcap {
		float: left;
		padding-right: var(--space-xs);
		font-size: 270%;
		line-height: .9;
	}
	.u-dropcap--l {
		float: left;
		padding-right: .5rem;
		font-size: 270%;
		line-height: .9;
	}
	@media (min-width:75em) {
		.u-dropcap--l {
			font-size: 460%;
			line-height: .75;
			font-weight: var(--font-weight-light);
			padding-top: .05em;
		}
	}
</style>

<span aria-labelledby="dropcap-{id}">
	<span aria-hidden="true">
		<span class="{variant}">{first_letter}</span>
		{remaining_text}
	</span>
	<span id="dropcap-{id}" class="u-sr-only">{text}</span>
</span>
