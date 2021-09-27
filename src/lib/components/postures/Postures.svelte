<script>
	import Tooltip from '$lib/components/Tooltip.svelte';

	export let postures = [];

	let infoTooltipMethods;
	let selectedPosture = postures[0];

	/**
	 * Toggles the info tooltip and updates its trigger ref if necessary.
	 *
	 * This allows to use multiple triggers for the same Tooltip instance. It
	 * allows to avoid duplicating / recreating its contents.
	 *
	 * @param {Object} e the DOM click event of the last trigger used to open the
	 *   info tooltip "singleton".
	 */
	const toggleInfoTooltip = e => {
		if (infoTooltipMethods.getCurrentTrigger() !== e.target) {
			infoTooltipMethods.recreate(e.target);
			infoTooltipMethods.open();
		} else {
			infoTooltipMethods.toggle();
		}
		// Maintain the currently selected posture data in sync with the last one
		// that was clicked for display inside the tooltip "singleton".
		selectedPosture = postures[
			infoTooltipMethods.getCurrentTrigger().getAttribute('data-posture-i')
		];
	};
</script>

<div class="postures">
	{#each postures as posture, i}
		<div class="posture" style="--x:{ posture.projectedX }px; --y:{ posture.projectedY }px; --scale:{ posture.projectedScale }em; --bg-color:hsla({ posture.hslaAngle }, 100%, 30%, 1)">
			<div class="hexagon">
				<div class="hexagon-inner-wrap">
					<button
						aria-describedby='info-tooltip'
						on:click|preventDefault={ toggleInfoTooltip }
						data-posture-i={ i }
					>
						{ posture.title }
					</button>
				</div>
			</div>
		</div>
	{/each}
</div>

<Tooltip
	id='info-tooltip'
	bind:exposedMethods={ infoTooltipMethods }
>
	<dl class="pop-content">
		<dt>instruments&nbsp;:</dt>
		<dd>{ selectedPosture.instruments }</dd>
		<dt>effets&nbsp;:</dt>
		<dd>{ selectedPosture.effets }</dd>
	</dl>
</Tooltip>

<style>
	.postures {
		text-align: center;
	}
	.posture {
		display: inline-block;
		vertical-align: middle;
		margin: var(--space);
	}
	.hexagon {
		--width: 7em;
		--height: 4.25em;
		font-size: var(--scale);
		position: relative;
		display: inline-block;
		margin-top: calc(var(--width) / 4);
		margin-bottom: calc(var(--width) / 4);
		width: var(--width);
		height: var(--height);
		text-align: center;
		font-weight: bold;
		color: white;
		background: var(--bg-color);
	}
	.hexagon::before,
	.hexagon::after {
		content: "";
		position: absolute;
		border-left: calc(var(--width) / 2) solid transparent;
		border-right: calc(var(--width) / 2) solid transparent;
	}
	.hexagon::before {
		left: 0;
		bottom: 100%;
		border-bottom: calc(var(--width) / 4) solid var(--bg-color);
	}
	.hexagon::after {
		left: 0;
		top: 100%;
		border-top: calc(var(--width) / 4) solid var(--bg-color);
	}
	.hexagon-inner-wrap {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: .25rem;
	}
	.hexagon-inner-wrap > button {
		color: inherit;
	}
	.pop-content {
    padding: 10px;
		width: 33ch;
    background: #fff;
		color: var(--bg-color);
  }
</style>
