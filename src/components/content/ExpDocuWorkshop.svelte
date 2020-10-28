<script>
	import Scene from '../perspective_2d/Scene.svelte';
	import { spring } from 'svelte/motion';

	let coords = spring({ x: 50, y: 50 }, {
		stiffness: 0.03,
		damping: 0.15
	});
</script>

<style>
	.wrap {
		flex-grow: 1;
	}
	.mouse-tracker {
		position: absolute;
		left: var(--x);
		top: var(--y);
	}
</style>

<h2>Test canvas</h2>

<div class="wrap full-vw" on:mousemove="{e => coords.set({ x: e.clientX, y: e.clientY })}">
	<hr/>
	<p
		class="mouse-tracker"
		style="--x:{ $coords.x }px; --y:{ $coords.y }px;"
	>
		testing position tracking of this DOM element
	</p>

	<Scene />
</div>
