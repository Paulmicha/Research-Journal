<script>
	import { spring } from 'svelte/motion';
	import { route } from '../../stores/route.js';
	import Scene from '../perspective_2d/Scene.svelte';

	// Load custom data.
	let postures = [];
	if ($route.data && $route.data.postures && $route.data.postures.items) {
		postures = $route.data.postures.items;
	}

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
		padding: 1rem 0;
		text-align: center;
		font-size: .75rem;
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
	/* .hexagon-inner-wrap {
		position: absolute;
		top: calc(var(--width) / 4);
		right: 0;
		bottom: calc(var(--width) / 4);
		left: 0;
		display: flex;
		align-items: stretch;
	} */
</style>

<h2>Test canvas</h2>

<!-- Debug. -->
<!-- <pre>src/components/content/ExpDocuWorkshop.svelte : $route = {JSON.stringify($route, null, 2)}</pre> -->
<pre>src/components/content/ExpDocuWorkshop.svelte : postures = {JSON.stringify(postures, null, 2)}</pre>

<div class="wrap full-vw" on:mousemove="{e => coords.set({ x: e.clientX, y: e.clientY })}">
	<hr/>
	{#each postures as posture}
		<div class="hexagon" style="--bg-color:hsla({ Math.random() * 360 }, 100%, 30%, 1)">
			<div class="hexagon-inner-wrap">
				<p>{ posture.title }</p>
			</div>
		</div>
	{/each}

	<!-- Tests WIP. -->
	<div
		class="mouse-tracker dot"
		style="--x:calc({ $coords.x }px - .5rem); --y:calc({ $coords.y }px - .5rem);"
	>
	</div>

	<Scene />
</div>
