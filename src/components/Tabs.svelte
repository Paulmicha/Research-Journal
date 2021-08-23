<script>
	import { setContext } from 'svelte';
	import TabContent from './TabContent.svelte';

	export let id = Math.random().toString(36).substr(2, 9);
	export let items = [];
	export let selected = 0;

	selected = parseInt(selected);

	setContext('Tabs.id', id);

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

	const tabClick = (e, i) => {
		e.preventDefault();
		selected = i;
		const tabs = Array.from(componentInstanceElement.querySelectorAll('[role="tab"]'));
		tabs.forEach((tab, i) => selected === i ? open(tab) : close(tab));
		const contentPanes = Array.from(componentInstanceElement.querySelectorAll('[role="tabpanel"]'));
		contentPanes.forEach((contentPane, i) => selected === i ? open(contentPane) : close(contentPane));
	};
</script>

<div class="tabs" bind:this={componentInstanceElement}>
	<div class="full-vw">
		<div class="full-vw--padded">
			<ul role="tablist">
				{#each items as item, i}
					<li class="tablist-item { selected === i ? 'is-on' : 'is-off' }">
						<a
							id="{ id }-{ i }-label"
							role="tab"
							tabindex={ i }
							href="#{ id }-{ i }"
							aria-controls="{ id }-{ i }"
							aria-selected="{ selected === i ? 'true' : 'false' }"
							class="tablist-link { selected === i ? 'is-on' : 'is-off' }"
							on:click={e => tabClick(e, i)}
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
		border-bottom: 1px solid black;
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
