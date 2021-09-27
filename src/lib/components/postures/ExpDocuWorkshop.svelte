<script>
	import { onMount } from "svelte";
	import { browser } from '$app/env';
	import Scene from '$lib/Scene';
	import SceneItem from '$lib/SceneItem';
	import { Canvas } from "svelte-canvas";
	import Postures from '$lib/components/postures/Postures.svelte';
	import Point from '$lib/components/perspective/Point.svelte';
	import posturesData from '$content/postures.json';

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
		posture.projectedScale = newProjectedPos.scale * 5; // <- Artificially multiply for better readability.
	}

	/**
	 * Positions elements.
	 */
	const initPosturesLayout = postures => {
		// For now, distribute in a grid of 5 columuns.
		const nbPerLine = 4;
		const linesNb = postures.length / nbPerLine;
		let currentLine = 0;
		const stepX = sceneW / nbPerLine;
		const stepY = sceneH / linesNb; // <- "line height", in px.
		return postures.map((posture, i) => {
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
			return posture;
		});
	};

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

		postures = postures.map(posture => {
			updatePos(posture, { z: maxScore - get_score(posture) });
			return posture;
		});
	}

	// Init custom data.
	let postures = initPosturesLayout(posturesData.items);

	/**
	 * Component is mounted into the DOM.
	 */
	onMount(async () => {
		scene.init(sceneW, sceneH, (sceneW + sceneH) / 2);
		// TODO can't figure out why we need to do this, but it is not getting the
		// correct initial positions unless this is delayed.
		// initPosturesLayout(postures);
		let failsafe = 15;
		while (postures[0].projectedScale < .1 && failsafe > 0) {
			failsafe--;
			await new Promise(resolve => setTimeout(() => {
				postures = initPosturesLayout(postures);
			}, 150));
		}
	});
</script>

<!-- Debug. -->
<!-- <pre>src/components/content/ExpDocuWorkshop.svelte : $route = {JSON.stringify($route, null, 2)}</pre> -->
<!-- <pre>src/components/content/ExpDocuWorkshop.svelte : postures = {JSON.stringify(postures, null, 2)}</pre> -->

<div class="full-vw fill-h">
	<div class="controls">
		<div>
			<span>impartial</span>
			<span>
				<input class="input--s" type="text" bind:value={ partial_weight } />
				<br/>
				<input type="range" on:input={ onWeightUpdate } value={ partial_weight } id="partial_weight" />
			</span>
			<span>partial</span>
		</div>
		<div>
			<span>formel</span>
			<span>
				<input class="input--s" type="text" bind:value={ informel_weight } />
				<br/>
				<input type="range" on:input={ onWeightUpdate } value={ informel_weight } id="informel_weight" />
			</span>
			<span>informel</span>
		</div>
		<div>
			<span>consensuel</span>
			<span>
				<input class="input--s" type="text" bind:value={ conflictuel_weight } />
				<br/>
				<input type="range" on:input={ onWeightUpdate } value={ conflictuel_weight } id="conflictuel_weight" />
			</span>
			<span>conflictuel</span>
		</div>
	</div>
	<div class="scene" bind:clientWidth={sceneW} bind:clientHeight={sceneH} style="--z_index:-1; --sceneMargin:{sceneMargin}rem">
		{#if browser}
			<Canvas width={sceneW} height={sceneH}>
				{#each postures as posture}
					<Point
						x={ posture.projectedX }
						y={ posture.projectedY }
						radius={ posture.projectedScale }
						fill="hsla({ posture.hslaAngle }, 100%, 30%, 1)"
					/>
				{/each}
			</Canvas>
		{/if}
	</div>
	<Postures { postures } />
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
		max-width: 2.33rem;
		text-align: center;
	}
</style>
