<script>
	import Scene from '../perspective_2d/Scene.svelte';
	import Point from '../perspective_2d/Point.svelte';

	let sceneW = 200;
	let sceneH = 200;

	let posX = 50;
	let posY = 50;
	let posZ = 20;
</script>

<!-- Debug. -->
<!-- <pre>PerspectiveTest2.svelte : sceneW = {JSON.stringify(sceneW, null, 2)}</pre> -->
<!-- <pre>PerspectiveTest2.svelte : sceneH = {JSON.stringify(sceneH, null, 2)}</pre> -->

<div class="controls f-grid">
	<div>
		<span>X</span>
		<span>
			<input type="text" bind:value={ posX } />
			<br/>
			<input type="range" bind:value={ posX } />
		</span>
	</div>
	<div>
		<span>Y</span>
		<span>
			<input type="text" bind:value={ posY } />
			<br/>
			<input type="range" bind:value={ posY } />
		</span>
	</div>
	<div>
		<span>Z</span>
		<span>
			<input type="text" bind:value={ posZ } />
			<br/>
			<input type="range" bind:value={ posZ } />
		</span>
	</div>
</div>

<Scene bind:width={sceneW} bind:height={sceneH}>
	<Point
		x={ posX * sceneW / 100 }
		y={ posY * sceneH / 100 }
		z={ posZ }
	/>
</Scene>

<style>
	.controls {
		font-size: .75rem;
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
</style>
