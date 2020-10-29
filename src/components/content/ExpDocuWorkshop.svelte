<script>
	import { spring } from 'svelte/motion';
	import { route } from '../../stores/route.js';
	// import Scene from '../perspective_2d/Scene.svelte';

	// Load custom data.
	let postures = [];
	route.subscribe(o => {
		if (o.data) {
			postures = o.data.postures.items
		}
	})

	// Tests WIP.
	let coords = spring({ x: 50, y: 50 }, {
		stiffness: 0.03,
		damping: 0.15
	});
</script>

<style>
	.wrap {
		flex-grow: 1;
		text-align: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.mouse-tracker {
		position: absolute;
		left: var(--x);
		top: var(--y);
	}
	.dot {
		height: 1rem;
		width: 1rem;
		background-color: #bbb;
		border-radius: 50%;
		display: inline-block;
	}
	.hexagon {
		--width: 7rem;
		position: relative;
		display: inline-block;
		margin-top: calc(var(--width) / 4);
		margin-bottom: calc(var(--width) / 4);
		width: var(--width);
		padding: 1.25rem 0;
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
</style>

<h2>Test WIP</h2>

<!-- Debug. -->
<!-- <pre>src/components/content/ExpDocuWorkshop.svelte : $route = {JSON.stringify($route, null, 2)}</pre> -->
<!-- <pre>src/components/content/ExpDocuWorkshop.svelte : postures = {JSON.stringify(postures, null, 2)}</pre> -->

<hr class="full-vw" />
<div class="wrap full-vw" on:mousemove="{e => coords.set({ x: e.clientX, y: e.clientY })}">

	<div class="f-grid">
		{#each postures as posture}
			<div class="item">
				<div class="hexagon" style="--bg-color:hsla({ Math.round(Math.random() * 360) }, 100%, 30%, 1)">
					<div class="hexagon-inner-wrap">
						<p>{ posture.title }</p>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Tests WIP. -->
	<div
		class="mouse-tracker dot"
		style="--x:calc({ $coords.x }px - .5rem); --y:calc({ $coords.y }px - .5rem);"
	>
	</div>

	<!-- <Scene /> -->
</div>
