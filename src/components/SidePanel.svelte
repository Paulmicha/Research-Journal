<script>
	export let pos = "absolute";
	export let zIndex = "1";
	export let w = "33ch";
	export let h = "60ch";
	export let dir = "ltr"; // left to right (other values TODO : rtl, ttb, btt).
	export let speed = ".33s";
	export let offset = "10vmin";

	export let id = Math.random().toString(36).substr(2, 9);

	let componentInstanceElement;

	/**
	 * Implements Svelte 'use' callback.
	 *
	 * Called when an element is created = mounted in the DOM.
	 */
	const init = el => {
		componentInstanceElement = el;
	};

	const open = () => {
		if (!componentInstanceElement.classList.contains('is-on')) {
			componentInstanceElement.classList.add('is-on');
		}
	}

	const close = () => {
		if (componentInstanceElement.classList.contains('is-on')) {
			componentInstanceElement.classList.remove('is-on');
		}
	}

	const toggle = () => {
		componentInstanceElement.classList.toggle('is-on');
	}

	export const exposedMethods = { open, close, toggle };
</script>

<div
	use:init
	id={ id }
	class="side-panel side-panel--{ dir } fx-shadow"
	style="--pos:{ pos }; --z-index:{ zIndex }; --w:{ w }; --h:{ h }; --speed:{ speed }; --offset:{ offset }"
>
	<div class="before">
		<button
			class="btn btn--s btn--inverse"
			on:click={e => { e.preventDefault(); close(e.target.closest('.side-panel')) }}
		>
			Close
		</button>
	</div>
	<div class="content rich-text--inverse">
		<slot />
	</div>
	<!-- <div class="after"></div> -->
</div>

<style>
	.side-panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		/* height: var(--h); */
		width: 0;
		position: var(--pos);
		z-index: var(--z-index);
		background-color: var(--color-invert-bg);
		overflow-x: hidden;
		transition: var(--speed);
		will-change: width;
	}
	.side-panel--ltr {
		top: var(--offset);
		left: 0;
		bottom: var(--offset);
	}
	.side-panel.is-on {
		width: var(--w);
	}
	.side-panel > * {
		width: 100%;
	}
	.before,
	.content {
		padding: var(--space);
	}
	.before > * {
		display: inline-block;
	}
	.side-panel--ltr .before {
		text-align: right;
	}
	.content {
		flex-grow: 1;
	}
</style>
