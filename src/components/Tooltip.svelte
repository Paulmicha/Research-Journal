<script>
	import { createPopper } from '@popperjs/core';
	import Dismissable from "./Dismissable.svelte";

	export let trigger;
	export let popperInstance = null;
	export let isOpen = null;
	export let placement = 'bottom';
	export let id = Math.random().toString(36).substr(2, 9);
	export let clickOutsideExclusions = [];

	let componentInstanceElement;
	let swappedTrigger;

	const init = element => {
		componentInstanceElement = element;
		popperInstance = createPopper(trigger, componentInstanceElement);
		if (!clickOutsideExclusions.includes(trigger)) {
			clickOutsideExclusions.push(trigger);
		}
	}

	/**
	 * This allows to reuse the same tooltip from another trigger.
	 *
	 * @param {Object} otherTrigger : [optional] DOM object of another trigger.
	 *   Omitting this argument will simply revert the component instance to its
	 *   initial configuration.
	 */
	const recreate = otherTrigger => {
		if (otherTrigger) {
			popperInstance = createPopper(otherTrigger, componentInstanceElement);
			if (!clickOutsideExclusions.includes(otherTrigger)) {
				clickOutsideExclusions.push(otherTrigger);
			}
			swappedTrigger = otherTrigger;
		} else {
			popperInstance = createPopper(trigger, componentInstanceElement);
			swappedTrigger = null;
		}
	}

	const open = () => {
		popperInstance.update(); // Ensures the position is always correct.
		componentInstanceElement.setAttribute('data-show', '');
		if (!componentInstanceElement.classList.contains('is-on')) {
			componentInstanceElement.classList.add('is-on');
		}
		isOpen = true;
	}

	const close = () => {
		componentInstanceElement.removeAttribute('data-show');
		if (componentInstanceElement.classList.contains('is-on')) {
			componentInstanceElement.classList.remove('is-on');
		}
		isOpen = null;
	}

	const toggle = () => {
		isOpen ? close() : open();
	}

	const getCurrentTrigger = () => swappedTrigger || trigger;

	export const exposedMethods = { open, close, toggle, recreate, getCurrentTrigger };
</script>

<Dismissable dismiss={ close } exclusions={ clickOutsideExclusions }>
	<div {id}
		use:init
		role="tooltip"
		class="tooltip fx-shadow"
		data-show={isOpen}
		data-popper-placement={placement}
	>
		<slot />
		<!-- <div class="arrow" data-popper-arrow></div> -->
	</div>
</Dismissable>

<style>
	.tooltip {
		display: none;
		border: 1px solid #CCC;
		box-shadow: var(--listShadow, 0 2px 3px 0 rgba(44, 62, 80, 0.24));
		border-radius: 4px;
		padding: var(--space-s) var(--space);
		background: white;
		/* background: #333; */
		/* color: white; */
		/* font-weight: bold; */
		/* font-size: 13px; */
		z-index: 1;
	}

	.tooltip[data-show] {
		display: block;
	}

	/* .arrow,
	.arrow::before {
		position: absolute;
		width: 8px;
		height: 8px;
		background: inherit;
	}

	.arrow {
		visibility: hidden;
	}

	.arrow::before {
		visibility: visible;
		content: '';
		transform: rotate(45deg);
	}

	.tooltip[data-popper-placement^='top'] > .arrow {
		bottom: -4px;
	}

	.tooltip[data-popper-placement^='bottom'] > .arrow {
		top: -4px;
	}

	.tooltip[data-popper-placement^='left'] > .arrow {
		right: -4px;
	}

	.tooltip[data-popper-placement^='right'] > .arrow {
		left: -4px;
	} */
</style>
