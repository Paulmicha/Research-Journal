<script>
	export let pos = "absolute";
	export let zIndex = "1";
	export let w = "42ch";
	export let h = "60ch";
	export let dir = "ltr"; // left to right (other values TODO : rtl, ttb, btt).
	export let speed = ".33s";
	export let offset = "25%";

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
		componentInstanceElement.setAttribute('aria-hidden', 'false');
		if (!componentInstanceElement.classList.contains('is-on')) {
			componentInstanceElement.classList.add('is-on');
		}
		if (!componentInstanceElement.classList.contains('has-triggered')) {
			componentInstanceElement.classList.add('has-triggered');
		}
	}

	const close = () => {
		componentInstanceElement.setAttribute('aria-hidden', 'true');
		if (componentInstanceElement.classList.contains('is-on')) {
			componentInstanceElement.classList.remove('is-on');
		}
	}

	const toggle = () => {
		componentInstanceElement.classList.toggle('is-on');
	}

	export const exposedMethods = { open, close, toggle };
</script>

<aside
	use:init
	id={ id }
	aria-hidden="true"
	class="side-panel side-panel--{ dir } fx-shadow"
	style="--pos:{ pos }; --z-index:{ zIndex }; --w:{ w }; --h:{ h }; --speed:{ speed }; --offset:{ offset }"
>
	<div class="before">
		<button
			aria-controls={ id }
			class="btn btn--s btn--inverse"
			on:click={e => { e.preventDefault(); close() }}
		>
			Close
		</button>
	</div>
	<div class="content rich-text--inverse">
		<slot />
	</div>
</aside>

<style>
	.side-panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: var(--w);
		position: var(--pos);
		z-index: var(--z-index);
		background-color: var(--color-invert-bg);
		transform: translateX(-100%);
	}
	.side-panel--ltr {
		top: var(--offset);
		left: 0;
	}

	/* TODO adapt to all directions */
	@keyframes tr-offcanvas-slide-in {
		/* 0% { transform: translateX(-100%); } */
		100% { transform: translateX(0%); }
	}
	@keyframes tr-offcanvas-slide-out {
		0% { transform: translateX(0%); }
		100% { transform: translateX(-100%); }
	}
	.side-panel.has-triggered[aria-hidden="true"] {
		animation: tr-offcanvas-slide-out var(--speed) forwards;
	}
	.side-panel.is-on,
	.side-panel:target,
	.side-panel[aria-hidden="false"] {
		animation: tr-offcanvas-slide-in var(--speed) forwards;
	}

	.side-panel > * {
		width: 100%;
	}
	.before {
		padding: var(--space) var(--space) 0 var(--space);
	}
	.content {
		padding: var(--space) var(--space) var(--space-xl) var(--space);
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
