<script>
	import { Layer } from 'svelte-canvas';

	export let scene;
	// export let render;
	export let priority = 1;

	export let x = (Math.random() - 0.5) * scene.offsetWidth;
	export let y = (Math.random() - 0.5) * scene.offsetHeight;
	export let z = Math.random() * scene.offsetWidth;
	export let radius = 10;
	// export let width = radius * 2;
	// export let height = radius * 2;

	let xProjected = 0;
	let yProjected = 0;
	let scaleProjected = 0;

	const project = () => {
		scaleProjected = scene.perspective / (scene.perspective + z);
		xProjected = (x * scaleProjected) + scene.projectionCenterX;
		yProjected = (y * scaleProjected) + scene.projectionCenterY;
	};

	$: render = ({ context }) => {
		context.globalAlpha = Math.abs(1 - z / scene.width);
		context.fillRect(
			xProjected - radius,
			yProjected - radius,
			radius * 2 * scaleProjected,
			radius * 2 * scaleProjected
		);
	};
</script>

<!-- DEBUG -->
<!-- <pre>Scene.svelte : width = {JSON.stringify(width, null, 2)}</pre> -->
<!-- <pre>Scene.svelte : height = {JSON.stringify(height, null, 2)}</pre> -->

<Layer {render} {priority} />
