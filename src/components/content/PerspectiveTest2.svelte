<script>
	import { onMount } from 'svelte';
	// import Scene from '../perspective_2d/Scene.svelte';
	// import Point from '../perspective_2d/Point.svelte';

	import Scene from '../../lib/projection_2d/Scene.js';
	import SceneItem from '../../lib/projection_2d/SceneItem.js';

	const scene = new Scene();
	const sceneIterator = scene.createIterator();

	let sceneW = 200;
	let sceneH = 200;

	// $: scene.init(sceneW, sceneH);

	let x = 50;
	let y = 50;
	let z = 0;

	let projectedX;
	let projectedY;
	let projectedZ;

	// let inputX;
	// let inputY;
	// let inputZ;

	const itemTest = new SceneItem({scene, x, y, z});

	const updatePos = (newPos) => {
		const newProjectedPos = itemTest.position(newPos);
		projectedX = newProjectedPos.x;
		projectedY = newProjectedPos.y;
		projectedZ = newProjectedPos.z;
	}

	scene.add(itemTest);

	// const updateInputs = (from) => {
	// 	switch(from) {
	// 		case 'input-x':
	// 			inputY.value = y;
	// 			inputZ.value = z;
	// 			break;
	// 		case 'input-y':
	// 			inputX.value = x;
	// 			inputZ.value = z;
	// 			break;
	// 		case 'input-z':
	// 			inputX.value = x;
	// 			inputY.value = y;
	// 			break;
	// 	}
	// }

	const onInputPos = (e) => {
		const inputRange = e.target;
		const value = inputRange.value;

		// scene.init(sceneW, sceneH);

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
		// updateInputs(inputRange.id);
	}

	/**
	 * TODO seems too soon to try to sync input range positions depending on
	 * bind:clientWidth={sceneW} and bind:clientHeight={sceneH}
	 * -> find workaround (delay ?)
	 */
	onMount(() => {
		// Debug.
		// console.log(`onMount() : sceneW = ${sceneW}, sceneH = ${sceneH}`);
		// console.log(inputX.value);

		// scene.init(sceneW, sceneH);

		x = sceneW / 2;
		y = sceneH / 2;
		z = 0;

		updatePos({ x, y, z });

		// inputX.value = x;
		// inputY.value = y;
		// inputZ.value = z;

		// console.log(sceneW / 2);
		// console.log(inputX.value);
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
			<input type="range" max="{sceneW}" id="input-x" on:input={onInputPos} bind:value={x} />
		</span>
	</div>
	<div>
		<span>Y</span>
		<span>
			<input type="text" bind:value={y} />
			<br/>
			<!-- <input type="range" max="{sceneH}" id="input-y" on:input={onInputPos} bind:this={inputY} /> -->
			<input type="range" max="{sceneH}" id="input-y" on:input={onInputPos} bind:value={y} />
		</span>
	</div>
	<div>
		<span>Z</span>
		<span>
			<input type="text" bind:value={z} />
			<br/>
			<!-- <input type="range" max="{sceneW}" id="input-z" on:input={onInputPos} bind:this={inputZ} /> -->
			<input type="range" max="{sceneW}" id="input-z" on:input={onInputPos} bind:value={z} />
		</span>
	</div>
</div>

<div class="scene" bind:clientWidth={sceneW} bind:clientHeight={sceneH} style="--z_index:-1">
	<div class="itemTest" style="position:absolute;left:{projectedX}px;top:{projectedY}px;z-index:-{projectedZ}">
		<pre>x (proj) = { x } ({ projectedX })</pre>
		<pre>y (proj) = { y } ({ projectedY })</pre>
		<pre>z (proj) = { z } ({ projectedZ })</pre>
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
		background: rgba(0,0,0,.2);
	}
</style>
