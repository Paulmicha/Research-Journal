<script>
	// import { createPopper } from '@popperjs/core';

	export let id = Math.random().toString(36).substr(2, 9);
	export let label = '';
	export let zIndex = "2";
	export let w = '42ch';
	export let speed = ".33s";
	export let isOpen = false;

	let componentInstanceElement;

	// CSS vars inline helper.
	const styleProps = { zIndex, w, speed };
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

<aside {id}
	bind:this={componentInstanceElement}
	aria-hidden="true"
	class="modal{ isOpen ? ' is-on' : '' }"
	style={inlineCssVars}
>
	<div class="before">
		{#if label.length }
			<strong>{ label }</strong>
		{/if}
		<button
			aria-controls={ id }
			class="btn btn--s btn--inverse"
			on:click|preventDefault={close}
		>
			Close
		</button>
	</div>
	<div class="content">
		<slot />
	</div>
</aside>

<style>
	.modal {
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 100%;
		position: fixed;
		z-index: var(--zIndex);
		opacity: 0;
		transition: opacity ease-out var(--speed);
	}
	.modal.is-on,
	.modal:target {
		opacity: 1;
	}

	/* Side panel contents */
	.modal > * {
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
