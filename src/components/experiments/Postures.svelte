<script>
	import Popover from 'svelte-popover';
	import { route } from '../../stores/route.js';

	export let partial_weight = 0;
	export let informel_weight = 0;
	export let conflictuel_weight = 0;

	const get_score = (posture) => partial_weight * posture.partial + informel_weight * posture.informel + conflictuel_weight * posture.conflictuel;

	// Load custom data.
	let postures = [];
	route.subscribe(o => {
		if (o.data) {
			postures = o.data.postures.items

			postures.forEach(posture => {
				posture.score = get_score(posture)
			});
		}
	})

	// $: postures_scores = postures ? postures.forEach(posture => get_score(posture)) : [];

	$: postures_scores = postures ? postures.forEach(posture => partial_weight * posture.partial + informel_weight * posture.informel + conflictuel_weight * posture.conflictuel) : [];

</script>

<style>
	.hexagon {
		--width: 7rem;
		--height: 4.25rem;
		position: relative;
		display: inline-block;
		margin-top: calc(var(--width) / 4);
		margin-bottom: calc(var(--width) / 4);
		/* padding: 1.25rem 0; */
		width: var(--width);
		height: var(--height);
		text-align: center;
		font-size: .75rem;
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
    background: #fff;
		color: var(--bg-color);
  }
	.debug {
		font-size: .66rem;
		padding: .33rem 0;
	}
</style>

<p class="debug">weights : { partial_weight },{ informel_weight },{ conflictuel_weight }</p>

<div class="f-grid">
	{#each postures as posture, i}
		<div>
			<!-- <div class="hexagon" style="--score:{ posture.score }; --bg-color:hsla({ Math.round(Math.random() * 360) }, 100%, 30%, 1)"> -->
			<div class="hexagon" style="--score:{ postures_scores && postures_scores[i] || 0 }; --bg-color:hsla({ Math.round(Math.random() * 360) }, 100%, 30%, 1)">
				<div class="hexagon-inner-wrap">
					<Popover arrowColor="#fff" action="hover">
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
