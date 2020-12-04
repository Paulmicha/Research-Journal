<script>
	// import { spring } from 'svelte/motion';
	import { route } from '../../stores/route.js';
	import { writable } from 'svelte/store';
	import { Canvas } from "svelte-canvas";
	import Popover from 'svelte-popover';
	import Postures from '../experiments/Postures.svelte';
	import Scene from '../perspective_2d/Scene.svelte';
	import Point from '../perspective_2d/Point.svelte';

	// Tests WIP.
	// let coords = spring({ x: 50, y: 50 }, {
	// 	stiffness: 0.03,
	// 	damping: 0.15
	// });

	let partial_weight = 25;
	let informel_weight = 25;
	let conflictuel_weight = 25;

	let vizWidth
	let vizHeight

	/**
	 * Utility to get a single "score" from all the weights.
	 */
	const get_score = (posture) => partial_weight * posture.partial + informel_weight * posture.informel + conflictuel_weight * posture.conflictuel;

	// This will allow the list of items to be updated using Svelte compiler "$".
	const posturesStore = writable([]);

	// Init custom data.
	let postures = [];
	route.subscribe(o => {
		if (o.data && o.data.postures) {
			postures = o.data.postures.items;
			postures.forEach(posture => {
				posture.score = get_score(posture);
			});
			posturesStore.update(() => postures);
		}
	});

	/**
	 * Updates any weight value.
	 */
	const onWeightUpdate = (e) => {
		const inputRange = e.target;
		const value = inputRange.value;

		switch(inputRange.id) {
			case 'partial_weight':
				partial_weight = value;
				break;
			case 'informel_weight':
				informel_weight = value;
				break;
			case 'conflictuel_weight':
				conflictuel_weight = value;
				break;
		}

		postures.forEach(posture => {
			posture.score = get_score(posture);
		});

		posturesStore.update(() => postures);
	}
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
	hr {
		margin-top: var(--space-l);
		margin-bottom: var(--space-l);
	}
</style>

<!-- Debug. -->
<!-- <pre>src/components/content/ExpDocuWorkshop.svelte : $route = {JSON.stringify($route, null, 2)}</pre> -->
<!-- <pre>src/components/content/ExpDocuWorkshop.svelte : postures = {JSON.stringify(postures, null, 2)}</pre> -->

<div class="controls f-grid">
	<div>
		<span>impartial</span>
		<span>
			<input type="text" bind:value={ partial_weight } />
			<!-- <input type="range" bind:value={ partial_weight } /> -->
			<input type="range" on:input={ onWeightUpdate } value={ partial_weight } id="partial_weight" />
		</span>
		<span>partial</span>
	</div>
	<div>
		<span>formel</span>
		<span>
			<input type="text" bind:value={ informel_weight } />
			<!-- <input type="range" bind:value={ informel_weight } /> -->
			<input type="range" on:input={ onWeightUpdate } value={ informel_weight } id="informel_weight" />
		</span>
		<span>informel</span>
	</div>
	<div>
		<span>consensuel</span>
		<span>
			<input type="text" bind:value={ conflictuel_weight } />
			<!-- <input type="range" bind:value={ conflictuel_weight } /> -->
			<input type="range" on:input={ onWeightUpdate } value={ conflictuel_weight } id="conflictuel_weight" />
		</span>
		<span>conflictuel</span>
	</div>
</div>

<hr class="full-vw" />
<div class="wrap full-vw" bind:clientWidth={vizWidth} bind:clientHeight={vizHeight}>
<!-- <div class="wrap full-vw" on:mousemove="{ e => coords.set({ x: e.clientX, y: e.clientY }) }"> -->

	<Postures postures={$posturesStore} />

	<Scene>
		{#each $posturesStore as posture, i}
			<Point
				x={ Math.random() * vizWidth }
				y={ Math.random() * vizHeight }
				fill="hsla({ Math.round(Math.random() * 360) }, 100%, 30%, 1)"
				radius={ 1 + posture.score / 200 }
			/>
		{/each}
	</Scene>

	<!-- Tests WIP. -->
	<!-- <div
		class="mouse-tracker dot"
		style="--x:calc({ $coords.x }px - .5rem); --y:calc({ $coords.y }px - .5rem);"
	>
	</div> -->

	<!-- <Scene /> -->
</div>

<!-- TODO (wip) -->
