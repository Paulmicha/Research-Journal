<script>
	import { onMount } from 'svelte';
	import Scene from '../../lib/projection_2d/Scene.js';
	import SceneItem from '../../lib/projection_2d/SceneItem.js';

	const scene = new Scene();
	// const sceneIterator = scene.createIterator();

	let sceneW = 200;
	let sceneH = 200;

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
		// x = scene.projectionCenterX;
		// y = scene.projectionCenterY;
		// z = scene.projectionCenterZ;
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
			<input type="text" bind:value={x} />
			<br/>
			<!-- <input type="range" max="{sceneW}" id="input-x" on:input={onInputPos} bind:this={inputX} /> -->
			<!-- <input type="range" max="{sceneW}" id="input-x" on:input={onInputPos} bind:value={x} /> -->
			<input type="range" min="{-sceneW / 2}" max="{sceneW / 2}" id="input-x" on:input={onInputPos} bind:value={x} />
		</span>
	</div>
	<div>
		<span>Y</span>
		<span>
			<input type="text" bind:value={y} />
			<br/>
			<!-- <input type="range" max="{sceneH}" id="input-y" on:input={onInputPos} bind:this={inputY} /> -->
			<!-- <input type="range" max="{sceneH}" id="input-y" on:input={onInputPos} bind:value={y} /> -->
			<input type="range" min="{-sceneH / 2}" max="{sceneH / 2}" id="input-y" on:input={onInputPos} bind:value={y} />
		</span>
	</div>
	<div>
		<span>Z</span>
		<span>
			<input type="text" bind:value={z} />
			<br/>
			<!-- <input type="range" max="{sceneW}" id="input-z" on:input={onInputPos} bind:this={inputZ} /> -->
			<input type="range" max="{(sceneW + sceneH) / 2}" id="input-z" on:input={onInputPos} bind:value={z} />
			<!-- <input type="range" min="{-(sceneW + sceneH) / 4}" max="{(sceneW + sceneH) / 4}" id="input-z" on:input={onInputPos} bind:value={z} /> -->
		</span>
	</div>
</div>

<div class="scene" bind:clientWidth={sceneW} bind:clientHeight={sceneH} style="--z_index:-1">
	<!-- <div class="itemTest" style="left:{projectedX}px; top:{projectedY}px; z-index:-{projectedScale}; width:${w}px; height:${h}px;"> -->
	<!-- <div class="itemTest" style="left:{projectedX}px; top:{projectedY}px; z-index:-{projectedScale}"> -->
	<div class="itemTest" style="--x:{projectedX}px; --y:{projectedY}px; --scale:{projectedScale}em">
		<pre>x (proj) = { x } ({ projectedX })</pre>
		<pre>y (proj) = { y } ({ projectedY })</pre>
		<pre>z (proj) = { z } ({ projectedScale })</pre>
	</div>
</div>

<!-- <Scene bind:width={sceneW} bind:height={sceneH}>
	<Point
		x={ x * sceneW / 100 }
		y={ y * sceneH / 100 }
		z={ z }
	/>
</Scene> -->

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
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: var(--z_index);
		width: 100%;
		height: 100%;
	}

	.itemTest {
		position: absolute;
		top: var(--y);
		left: var(--x);
		font-size: var(--scale);
		background: rgba(0,0,0,.2);
	}
</style>
