<script>
	import { setContext, createEventDispatcher } from 'svelte';
	import TabContent from './TabContent.svelte';

	// TODO combine all A11Y features from :
	// https://codepen.io/heydon/pen/veeaEa/
	// https://github.com/nico3333fr/van11y-accessible-tab-panel-aria

	export let id = Math.random().toString(36).substr(2, 9);
	export let items = [];
	export let selected = 0;

	// Support array of strings as items labels (instead of objects).
	if (items.length && typeof items[0] === "string") {
		items = items.map(item => {
			return {
				label: item
			};
		});
	}

	const dispatch = createEventDispatcher();

	selected = parseInt(selected);

	setContext('Tabs.id', id);
	setContext('Tabs.selected', selected);

	let componentInstanceElement;

	const open = el => {
		if (el.hasAttribute('aria-hidden')) {
			el.setAttribute('aria-hidden', 'false');
		}
		if (el.hasAttribute('aria-selected')) {
			el.setAttribute('aria-selected', 'true');
		}
		if (el.classList.contains('is-off')) {
			el.classList.remove('is-off');
		}
		if (!el.classList.contains('is-on')) {
			el.classList.add('is-on');
		}
	}

	const close = el => {
		if (el.hasAttribute('aria-hidden')) {
			el.setAttribute('aria-hidden', 'true');
		}
		if (el.hasAttribute('aria-selected')) {
			el.setAttribute('aria-selected', 'false');
		}
		if (el.classList.contains('is-on')) {
			el.classList.remove('is-on');
		}
		if (!el.classList.contains('is-off')) {
			el.classList.add('is-off');
		}
	}

	/**
	 * Toggles tab contents visibility.
	 *
	 * Svelte already handles tabs attributes automatically - i.e. <li> and <a>.
	 */
	const tabClick = async (e, i) => {
		selected = parseInt(i);
		const contentPanes = Array.from(componentInstanceElement.querySelectorAll('[role="tabpanel"]'));
		contentPanes.forEach((contentPane, i) => selected === i ? open(contentPane) : close(contentPane));
		dispatch('change', { selected });
	};
</script>

<!-- Debug. -->
<!-- <pre>Tabs : { JSON.stringify(selected, null, 2) } </pre> -->

<div class="tabs" bind:this={componentInstanceElement}>
	<div class="full-vw">
		<div class="full-vw--padded">
			<ul role="tablist">
				{#each items as item, i}
					<li role="presentation" class="tablist-item { parseInt(selected) === i ? 'is-on' : 'is-off' }">
						<a
							id="{ id }-{ i }-label"
							role="tab"
							tabindex={ i }
							href="#{ id }-{ i }"
							aria-controls="{ id }-{ i }"
							aria-selected="{ parseInt(selected) === i ? 'true' : 'false' }"
							class="tablist-link { parseInt(selected) === i ? 'is-on' : 'is-off' }"
							on:click|preventDefault={e => tabClick(e, i)}
						>
							{ item.label }
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</div>
	<slot>
		{#each items as item, i}
			<TabContent {i}>
				{! item.content || '' }
			</TabContent>
		{/each}
	</slot>
</div>

<style>
	.tabs {
		margin-top: var(--space);
	}
	.full-vw::after {
		content: '';
		display: block;
		margin: auto;
		width: 90%;
		height: 1px;
		background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));
	}
	ul {
		list-style: none;
		display: flex;
	}
	.tablist-item {
		border-top: 1px solid black;
		border-right: 1px solid black;
		border-left: 1px solid black;
	}
	.tablist-item + .tablist-item {
		border-left: 0;
	}
	.tablist-link {
		display: inline-block;
		padding: var(--space) var(--space-l);
		text-decoration: none;
		background-color: white;
	}
	.tablist-link.is-on {
		position: relative;
		bottom: -1px;
	}
</style>
