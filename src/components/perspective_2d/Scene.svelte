<script context="module">
	import Scene from '../../lib/projection_2d/Scene.js';
	const scene = new Scene();
	const sceneIterator = scene.createIterator();
</script>

<script>
	import { Canvas } from 'svelte-canvas';
	// import { extent } from 'd3-array';
	// import { scaleLinear } from 'd3-scale';
	// import Axis from './Axis.svelte';

	export let z_index = -1;

	// const margin = { top: 20, right: 20, bottom: 20, left: 40 };

	let width;
	let height;
	$: depth = (width + height) / 2;

	// $: x = scaleLinear()
	// 	// .domain(extent(points, d => d.mpg))
	// 	.domain([0, width])
	// 	.range([margin.left, width - margin.right])
	// 	.nice()

	// $: y = scaleLinear()
	// 	.domain([0, height])
	// 	.range([height - margin.bottom, margin.top])
	// 	.nice()

	// $: z = scaleLinear()
	// 	.domain([0, depth])
	// 	.range([0, depth])
	// 	.nice()
</script>

<style>
	.scene-wrapper {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: var(--z_index);
		width: 100%;
		height: 100%;
	}
</style>

<!-- DEBUG -->
<!-- <pre>Scene.svelte : width = {JSON.stringify(width, null, 2)}</pre> -->
<!-- <pre>Scene.svelte : height = {JSON.stringify(height, null, 2)}</pre> -->

<div bind:clientWidth={width} bind:clientHeight={height} class="scene-wrapper" style="--z_index:{z_index}">
	<Canvas {width} {height}>
		<!-- <Axis type="x" scale={x} tickNumber={10} {margin} /> -->
		<!-- <Axis type="y" scale={y} tickNumber={10} {margin} /> -->
		<!-- <Axis type="z" scale={z} tickNumber={10} {margin} /> -->
		<slot></slot>
	</Canvas>
</div>
