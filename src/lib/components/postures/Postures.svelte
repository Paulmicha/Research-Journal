<script>
	import Popover from 'svelte-popover';
	export let postures = [];
</script>

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
	[slot="target"] {
		cursor: pointer;
	}
	.pop-content {
    padding: 10px;
		width: 33ch;
    background: #fff;
		color: var(--bg-color);
  }
</style>

<div class="postures">
	{#each postures as posture, i}
		<div class="posture" style="--x:{posture.projectedX}px; --y:{posture.projectedY}px; --scale:{posture.projectedScale}em; --bg-color:hsla({ posture.hslaAngle }, 100%, 30%, 1)">
			<div class="hexagon">
				<div class="hexagon-inner-wrap">
					<Popover arrowColor="#fff">
						<p slot="target">{ posture.title }</p>
						<dl slot="content" class="pop-content">
							<dt>instruments&nbsp;:</dt>
							<dd>{ posture.instruments }</dd>
							<dt>effets&nbsp;:</dt>
							<dd>{ posture.effets }</dd>
						</dl>
					</Popover>
				</div>
			</div>
		</div>
	{/each}
</div>
