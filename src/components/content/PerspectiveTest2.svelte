<script>
	import { onMount } from 'svelte';
	import { Canvas } from 'svelte-canvas';

	import Scene from '../../lib/projection_2d/Scene.js';
	import SceneItem from '../../lib/projection_2d/SceneItem.js';
	import Point from '../perspective_2d/Point.svelte';

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
	let r = 260;

	let projectedX;
	let projectedY;
	let projectedScale;

	// const itemTest = new SceneItem({scene, x, y, z, w, h});
	const itemTest = new SceneItem({scene, x, y, z, r});
	scene.add(itemTest);

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
	 * Start at the 3D center when component is mounted into the DOM.
	 */
	onMount(() => {
		scene.init(sceneW, sceneH, (sceneW + sceneH) / 2);
		updatePos({ x, y, z });
  });

</script>


<!-- Debug. -->
<!-- <pre>PerspectiveTest2.svelte : sceneW = {JSON.stringify(sceneW, null, 2)}</pre> -->
<!-- <pre>PerspectiveTest2.svelte : sceneH = {JSON.stringify(sceneH, null, 2)}</pre> -->
<!-- <pre>scene width : { sceneW }, scene height : { sceneH }</pre> -->
<!-- <pre>itemTest.position = {JSON.stringify(itemTest.position({x, y, z}), null, 2)}</pre> -->


<div class="controls f-grid">
	<div>
		<span>X</span>
		<span>
			3D : <input type="text" bind:value={x} />
			<br/>
			2D : <input type="text" bind:value={projectedX} />
			<br/>
			<input type="range" min="{-sceneW / 2}" max="{sceneW / 2}" id="input-x" on:input={onInputPos} bind:value={x} />
		</span>
	</div>
	<div>
		<span>Y</span>
		<span>
			3D : <input type="text" bind:value={y} />
			<br/>
			2D : <input type="text" bind:value={projectedY} />
			<br/>
			<input type="range" min="{-sceneH / 2}" max="{sceneH / 2}" id="input-y" on:input={onInputPos} bind:value={y} />
		</span>
	</div>
	<div>
		<span>Z</span>
		<span>
			3D : <input type="text" bind:value={z} />
			<br/>
			Scale : <input type="text" bind:value={projectedScale} />
			<br/>
			<input type="range" max="{(sceneW + sceneH) / 2}" id="input-z" on:input={onInputPos} bind:value={z} />
		</span>
	</div>
</div>


<div class="scene" bind:clientWidth={sceneW} bind:clientHeight={sceneH} style="--z_index:-1; --sceneMargin:{sceneMargin}rem">

	<Canvas width={sceneW} height={sceneH}>
		<Point
			x={ projectedX }
			y={ projectedY }
			radius={ projectedScale * 50 }
		/>
	</Canvas>

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
		text-align: center;
	}
	.controls input {
		display: inline-block;
	}
	.controls input[type="text"] {
		max-width: 2rem;
	}

	.scene {
		position: absolute;
		top: var(--sceneMargin);
		right: var(--sceneMargin);
		bottom: var(--sceneMargin);
		left: var(--sceneMargin);
		z-index: var(--z_index);
		border: 5px dashed gray;
		/* width: calc(100- var(--sceneMargin));
		height: calc(100% - var(--sceneMargin)); */
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
