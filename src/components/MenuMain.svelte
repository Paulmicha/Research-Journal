<script>
	export let items = [];
</script>

<!-- DEBUG -->
<!-- <pre>MenuMain.svelte : items = {JSON.stringify(items, null, 2)}</pre> -->

<nav class="MenuMain">
	{#each items as { title, path, is_active }, i}
		<div class="MenuMain-item{ is_active ? ' is-active' : '' }">
			{#if is_active}
				<span class="MenuMain-deco"></span>
			{/if}
			<a class="MenuMain-link" rel=prefetch href="/{ path }" aria-current={ is_active ? "page" : undefined }>
				{ title }
			</a>
		</div>
	{/each}
</nav>
