<script>
	import Scene from '../../lib/projection_2d/Scene.js';

	export let depth = -1;

	/**
	 * Implements Svelte 'use' hook (action).
	 *
	 * Called when an element is created = mounted in the DOM.
	 * Can return an object with a destroy method that is called after the element
	 * is unmounted.
	 */
	const init = element => {
		// Debug.
		// console.log(element)
		// console.log(`width = ${element.clientWidth}`)
		// console.log(`height = ${element.clientHeight}`)

		const s = new Scene(element.clientWidth, element.clientHeight);

		return {
			destroy() {
				// Debug.
				console.log("removed Scene element")
			}
		};
	};
</script>

<style>
	canvas {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: var(--depth);
		width: 100%;
		height: 100%;
	}
</style>

<canvas use:init style="--depth:{depth}"></canvas>
