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

	// Manipulation : weighted criterias impacting a single score, then used to
	// scale up or down the items.
	let partial_weight = 0;
	let informel_weight = 0;
	let conflictuel_weight = 0;

	const get_score = (posture) => partial_weight * posture.partial + informel_weight * posture.informel + conflictuel_weight * posture.conflictuel;

	postures.forEach(posture => {
		posture.score = get_score(posture)
	});

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
	/* .mouse-tracker {
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
	} */
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
	.controls {
		font-size: .75rem;
		margin: 1rem 0;
	}
	.controls.f-grid {
		flex-wrap: nowrap;
	}
	.controls > * {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.controls > * > * {
		padding: 0 .5rem;
		text-align: center;
	}
	.controls input {
		display: inline-block;
	}
	.controls input[type="text"] {
		max-width: 2rem;
	}
</style>

<h2>Test WIP</h2>

<!-- Debug. -->
<!-- <pre>src/components/content/ExpDocuWorkshop.svelte : $route = {JSON.stringify($route, null, 2)}</pre> -->
<!-- <pre>src/components/content/ExpDocuWorkshop.svelte : postures = {JSON.stringify(postures, null, 2)}</pre> -->

<div class="controls f-grid">
	<div>
		<span>partial</span>
		<span>
			<input type="text" bind:value={ partial_weight } />
			<input type="range" bind:value={ partial_weight } />
		</span>
		<span>impartial</span>
	</div>
	<div>
		<span>informel</span>
		<span>
			<input type="text" bind:value={ informel_weight } />
			<input type="range" bind:value={ informel_weight } />
		</span>
		<span>formel</span>
	</div>
	<div>
		<span>conflictuel</span>
		<span>
			<input type="text" bind:value={ conflictuel_weight } />
			<input type="range" bind:value={ conflictuel_weight } />
		</span>
		<span>consensuel</span>
	</div>
</div>

<hr class="full-vw" />
<div class="wrap full-vw" on:mousemove="{e => coords.set({ x: e.clientX, y: e.clientY })}">

	<div class="f-grid">
		{#each postures as posture}
			<div>
				<div class="hexagon" style="--score:{ posture.score }; --bg-color:hsla({ Math.round(Math.random() * 360) }, 100%, 30%, 1)">
					<div class="hexagon-inner-wrap">
						<p>{ posture.title }</p>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Tests WIP. -->
	<!-- <div
		class="mouse-tracker dot"
		style="--x:calc({ $coords.x }px - .5rem); --y:calc({ $coords.y }px - .5rem);"
	>
	</div> -->

	<!-- <Scene /> -->
</div>
