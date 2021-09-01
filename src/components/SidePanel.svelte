<script>
	// import Dismissable from "./Dismissable.svelte";

	export let pos = "fixed";
	export let zIndex = "1";
	export let w = '';
	export let dir = "ltr"; // left to right (other values TODO : rtl, ttb, btt).
	export let speed = ".33s";
	export let offset = "25%";
	export let bg = "var(--color-invert-bg)";
	export let id = Math.random().toString(36).substr(2, 9);
	export let label = '';

	let componentInstanceElement;

	// Default width depends on direction.
	if (!w.length) {
		if (dir === 'ltr' || dir === 'rtl') {
			w = "42ch";
		} else {
			w = "90vmin";
		}
	}

	// CSS vars inline helper.
	const styleProps = { pos, zIndex, w, dir, speed, offset, bg };
	const inlineCssVars = Object.keys(styleProps)
		.filter(k => styleProps[k] && styleProps[k].length)
		.map(k => `--${k}:${styleProps[k]}`)
		.join('; ');

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

<svelte:window on:keydown={ e => { e.key === "Escape" && close() }} />

<aside {id}
	bind:this={ componentInstanceElement }
	aria-hidden="true"
	class="side-panel side-panel--{dir} fx-shadow rich-text--inverse"
	style={ inlineCssVars }
>
	<div class="before">
		{#if label.length }
			<strong>{ label }</strong>
		{/if}
		<button
			aria-controls={ id }
			class="btn btn--s btn--inverse"
			on:click={e => { e.preventDefault(); close() }}
		>
			Close
		</button>
	</div>
	<div class="content">
		<slot />
	</div>
</aside>

<style>
	.side-panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: var(--w);
		max-width: 100%;
		position: var(--pos);
		z-index: var(--zIndex);
		background-color: var(--bg);
		opacity: 0;
		transition: opacity ease-out var(--speed);
	}
	.side-panel.is-on,
	.side-panel:target {
		opacity: 1;
	}

	/* Horizontal shared styles */
	.side-panel--ltr,
	.side-panel--rtl {
		top: var(--offset);
	}

	/* Left to Right */
	.side-panel--ltr {
		left: 0;
		transform: translateX(-100%);
	}
	@keyframes tr-offcanvas-slide-in--ltr {
		100% { transform: translateX(0%); }
	}
	@keyframes tr-offcanvas-slide-out--ltr {
		0% { transform: translateX(0%); }
		100% { transform: translateX(-100%); }
	}
	.side-panel--ltr.has-triggered[aria-hidden="true"] {
		animation: tr-offcanvas-slide-out--ltr var(--speed) forwards;
	}
	.side-panel--ltr.is-on,
	.side-panel--ltr:target {
		animation: tr-offcanvas-slide-in--ltr var(--speed) forwards;
	}

	/* Right to Left */
	.side-panel--rtl {
		right: 0;
		transform: translateX(100%);
	}
	@keyframes tr-offcanvas-slide-in--rtl {
		100% { transform: translateX(0%); }
	}
	@keyframes tr-offcanvas-slide-out--rtl {
		0% { transform: translateX(0%); }
		100% { transform: translateX(100%); }
	}
	.side-panel--rtl.has-triggered[aria-hidden="true"] {
		animation: tr-offcanvas-slide-out--rtl var(--speed) forwards;
	}
	.side-panel--rtl.is-on,
	.side-panel--rtl:target {
		animation: tr-offcanvas-slide-in--rtl var(--speed) forwards;
	}

	/* Vertical shared styles */
	.side-panel--btt,
	.side-panel--ttb {
		left: calc((100vw - var(--w)) / 2);
		right: calc((100vw - var(--w)) / 2);
	}

	/* Bottom to Top */
	.side-panel--btt {
		bottom: 0;
		transform: translateY(100%);
	}
	@keyframes tr-offcanvas-slide-in--btt {
		100% { transform: translateY(0%); }
	}
	@keyframes tr-offcanvas-slide-out--btt {
		0% { transform: translateY(0%); }
		100% { transform: translateY(100%); }
	}
	.side-panel--btt.has-triggered[aria-hidden="true"] {
		animation: tr-offcanvas-slide-out--btt var(--speed) forwards;
	}
	.side-panel--btt.is-on,
	.side-panel--btt:target {
		animation: tr-offcanvas-slide-in--btt var(--speed) forwards;
	}

	/* Top to Bottom */
	/* (TODO) */

	/* Side panel contents */
	.side-panel > * {
		width: 100%;
	}
	.before {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		padding: var(--space) var(--space) 0 var(--space);
	}
	.before > strong {
		flex-grow: 1;
		text-align: center;
	}
	.before > button {
		margin-left: auto;
	}
	.content {
		flex-grow: 1;
		padding: var(--space) var(--space) var(--space-xl) var(--space);
	}
</style>
