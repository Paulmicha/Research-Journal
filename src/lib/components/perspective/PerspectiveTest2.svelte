<script>
	import { Canvas } from 'svelte-canvas';
	import { onMount } from 'svelte';
	import { browser } from '$app/env';
	// import { toPixels } from '$lib/generic_utils.js';

	import Scene from '$lib/perspective/Scene.js';
	import SceneItem from '$lib/perspective/SceneItem.js';
	import Point from '$lib/components/perspective/Point.svelte';

	const scene = new Scene();
	// const sceneIterator = scene.createIterator();

	let sceneW = 200;
	let sceneH = 200;
	let sceneMargin = 5; // <- in CSS "rem" unit.

	let x = 0;
	let y = 0;
	let z = 0;
	// let w = 260;
	// let h = 75;
	// let r = 260;

	let projectedX;
	let projectedY;
	let projectedScale;

	// const itemTest = new SceneItem({ scene, x, y, z, w, h });
	// const itemTest = new SceneItem({ scene, x, y, z, r });
	const itemTest = new SceneItem({ scene, x, y, z });

	scene.add(itemTest);

	/**
	 * Scene resize.
	 */
	const updateScene = () => {
		scene.init(sceneW, sceneH, (sceneW + sceneH) / 2);
		updatePos({ x, y, z });
	}

	/**
	 * Computes projected coordinates on every change in position.
	 *
	 * @see src/lib/projection_2d/SceneItem.js
	 */
	const updatePos = (newPos) => {
		const newProjectedPos = itemTest.position(newPos);
		projectedX = newProjectedPos.x;
		projectedY = newProjectedPos.y;
		projectedScale = newProjectedPos.scale;
	}

	/**
	 * Reacts to range inputs.
	 */
	const onInputPos = (e) => {
		const inputRange = e.target;
		const value = parseFloat(inputRange.value);
		const newPos = {};

		switch(inputRange.id) {
			case 'input-x':
				x = value;
				newPos.x = x;
				break;
			case 'input-y':
				y = value;
				newPos.y = y;
				break;
			case 'input-z':
				z = value;
				newPos.z = z;
				break;
		}

		updatePos(newPos);
	}

	/**
	 * Initializes resize observer.
	 */
	const resizer = el => {
		// const margin = toPixels(sceneMargin + 'rem', el);

		const ro = new ResizeObserver((entries) => {
			entries.forEach((watched) => {
				const contentRect = watched.contentRect;

				sceneW = contentRect.width;
				sceneH = contentRect.height;

				// Prevents items to be displayed outside of the scene.
				// TODO implement reverse computing of positions (projected -> 3D).
				if (projectedX > sceneW + 1) {
					x = 0;
				}
				if (projectedY > sceneH + 1) {
					y = 0;
				}

				updateScene();
			});
		});

		ro.observe(el);

		return {
			destroy() {
				ro.unobserve(el);
			}
		};
	};

	/**
	 * Start at the 3D center when component is mounted into the DOM.
	 */
	onMount(() => {
		updateScene();
	});
</script>


<!-- Debug. -->
<!-- <pre>PerspectiveTest2.svelte : scene width : { sceneW }, scene height : { sceneH }</pre> -->


<div class="controls f-grid">
	<div>
		<span>X</span>
		<span>
			3D : <input class="input--s u-center" type="text" bind:value={x} />
			<br/>
			2D : <input class="input--s u-center" type="text" bind:value={projectedX} />
			<br/>
			<input type="range" min="{-sceneW / 2}" max="{sceneW / 2}" id="input-x" on:input={onInputPos} bind:value={x} />
		</span>
	</div>
	<div>
		<span>Y</span>
		<span>
			3D : <input class="input--s u-center" type="text" bind:value={y} />
			<br/>
			2D : <input class="input--s u-center" type="text" bind:value={projectedY} />
			<br/>
			<input type="range" min="{-sceneH / 2}" max="{sceneH / 2}" id="input-y" on:input={onInputPos} bind:value={y} />
		</span>
	</div>
	<div>
		<span>Z</span>
		<span>
			3D : <input class="input--s u-center" type="text" bind:value={z} />
			<br/>
			Scale : <input class="input--s u-center" type="text" bind:value={projectedScale} />
			<br/>
			<input type="range" max="{(sceneW + sceneH) / 2}" id="input-z" on:input={onInputPos} bind:value={z} />
		</span>
	</div>
</div>


<div class="scene" bind:clientWidth={sceneW} bind:clientHeight={sceneH} style="--z_index:-1; --sceneMargin:{sceneMargin}rem" use:resizer>

	{#if browser}
		<Canvas width={sceneW} height={sceneH}>
			<Point
				x={ projectedX }
				y={ projectedY }
				radius={ projectedScale * 50 }
			/>
		</Canvas>
	{/if}

	<div class="itemTest" style="--x:{projectedX}px; --y:{projectedY}px; --scale:{projectedScale}em">
		<pre>3D coords : { x }, { y }, { z }</pre>
		<pre>2D coords : { projectedX },{ projectedY }</pre>
		<pre>2D scale : { projectedScale }</pre>
	</div>

</div>


<style>
	.controls {
		font-size: .75rem;
		margin: var(--space) 0;
	}
	.controls.f-grid {
		flex-wrap: nowrap;
	}
	.controls > * {
		display: flex;
		align-items: center;
	}
	.controls > * > * {
		padding: 0 .5rem;
		text-align: right;
	}
	.controls input {
		display: inline-block;
	}
	.controls input[type="text"] {
		max-width: 3.5rem;
		background-color: white;
	}

	.scene {
		position: absolute;
		top: var(--sceneMargin);
		right: var(--sceneMargin);
		bottom: var(--sceneMargin);
		left: var(--sceneMargin);
		z-index: var(--z_index);
		border: 5px dashed gray;
		overflow: hidden;
	}

	.itemTest {
		position: absolute;
		top: var(--y);
		left: var(--x);
		padding: 1em;
		font-size: var(--scale);
		background: rgba(0,0,0,.2);
	}
</style>
