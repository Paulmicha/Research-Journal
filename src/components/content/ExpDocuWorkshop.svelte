<script>
	import { Canvas } from "svelte-canvas";
	import { onMount } from 'svelte';
	import { route } from '../../stores/route.js';
	// import { spring } from 'svelte/motion';
	import { writable } from 'svelte/store';

	import Scene from '../../lib/projection_2d/Scene.js';
	import SceneItem from '../../lib/projection_2d/SceneItem.js';

	import Popover from 'svelte-popover';
	import Postures from '../experiments/Postures.svelte';
	import Point from '../canvas_items/Point.svelte';

	// Tests WIP.
	// let coords = spring({ x: 50, y: 50 }, {
	// 	stiffness: 0.03,
	// 	damping: 0.15
	// });

	const scene = new Scene();

	const maxScore = 3000; // <- 10 (individual criteria max value in source data) x 100 (input range max value) x 3 criterias
	let partial_weight = 25;
	let informel_weight = 25;
	let conflictuel_weight = 25;

	let sceneW = 200;
	let sceneH = 200;
	let sceneMargin = 5; // <- in CSS "rem" unit.

	// Bg circles.
	const radius = 150;

	/**
	 * Utility to get a single "score" from all the weights.
	 */
	// const get_score = (posture) => maxScore;
	const get_score = (posture) => partial_weight * posture.partial
		+ informel_weight * posture.informel
		+ conflictuel_weight * posture.conflictuel;

	/**
	 * Computes projected coordinates on every change in position.
	 *
	 * @see src/lib/projection_2d/SceneItem.js
	 */
	const updatePos = (posture, newPos) => {
		const newProjectedPos = posture.si.position(newPos);
		posture.projectedX = newProjectedPos.x;
		posture.projectedY = newProjectedPos.y;
		// posture.projectedScale = newProjectedPos.scale;
		posture.projectedScale = newProjectedPos.scale * 5; // <- Artificially multiply for better readability.
	}

	// This will allow the list of items to be updated using Svelte compiler "$".
	const posturesStore = writable([]);

	// Init custom data.
	let postures = [];
	route.subscribe(o => {
		if (o.data && o.data.postures) {
			postures = o.data.postures.items;

			// For now, distribute in a grid of 5 columuns.
			const nbPerLine = 4;
			const linesNb = postures.length / nbPerLine;
			let currentLine = 0;
			const stepX = sceneW / nbPerLine;
			const stepY = sceneH / linesNb; // <- "line height", in px.

			postures.forEach((posture, i) => {
				const currentCol = i % nbPerLine;
				if (i > 0 && i % nbPerLine === 0) {
					currentLine++;
				}
				const x = -sceneW / 2 + currentCol * stepX - radius / 2 + stepX / 2;
				const y = -sceneH / 2 + currentLine * stepY - radius / 2 + stepY / 2;
				const z = maxScore - get_score(posture);

				// Debug.
				// console.log({ x, y, z });

				posture.si = new SceneItem({ scene, x, y, z });
				updatePos(posture);

				posture.hslaAngle = Math.round(Math.random() * 360);
			});

			posturesStore.set(postures);
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
			updatePos(posture, { z: maxScore - get_score(posture) });
		});

		posturesStore.set(postures);
	}

	/**
	 * Component is mounted into the DOM.
	 */
	onMount(() => {
		scene.init(sceneW, sceneH, (sceneW + sceneH) / 2);
	});
</script>


<!-- Debug. -->
<!-- <pre>src/components/content/ExpDocuWorkshop.svelte : $route = {JSON.stringify($route, null, 2)}</pre> -->
<!-- <pre>src/components/content/ExpDocuWorkshop.svelte : postures = {JSON.stringify(postures, null, 2)}</pre> -->


<div class="full-vw">
	<div class="controls">
		<div>
			<span>impartial</span>
			<span>
				<input type="text" bind:value={ partial_weight } />
				<br/>
				<input type="range" on:input={ onWeightUpdate } value={ partial_weight } id="partial_weight" />
			</span>
			<span>partial</span>
		</div>
		<div>
			<span>formel</span>
			<span>
				<input type="text" bind:value={ informel_weight } />
				<br/>
				<input type="range" on:input={ onWeightUpdate } value={ informel_weight } id="informel_weight" />
			</span>
			<span>informel</span>
		</div>
		<div>
			<span>consensuel</span>
			<span>
				<input type="text" bind:value={ conflictuel_weight } />
				<br/>
				<input type="range" on:input={ onWeightUpdate } value={ conflictuel_weight } id="conflictuel_weight" />
			</span>
			<span>conflictuel</span>
		</div>
	</div>

	<div class="scene" bind:clientWidth={sceneW} bind:clientHeight={sceneH} style="--z_index:-1; --sceneMargin:{sceneMargin}rem">
	<!-- <div class="wrap full-vw" on:mousemove="{ e => coords.set({ x: e.clientX, y: e.clientY }) }"> -->

		<Canvas width={sceneW} height={sceneH}>
			{#each $posturesStore as posture, i}
				<Point
					x={ posture.projectedX }
					y={ posture.projectedY }
					radius={ posture.projectedScale }
					fill="hsla({ posture.hslaAngle }, 100%, 30%, 1)"
				/>
			{/each}
		</Canvas>

		<!-- Tests WIP. -->
		<!-- <div
			class="mouse-tracker dot"
			style="--x:calc({ $coords.x }px - .5rem); --y:calc({ $coords.y }px - .5rem);"
		>
		</div> -->
	</div>

	<Postures postures={$posturesStore} />

</div>


<style>
	.scene {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: var(--z_index);
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
		text-align: center;
	}
	.controls > * {
		display: inline-flex;
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
