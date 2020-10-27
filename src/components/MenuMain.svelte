<script>
	export let items = [];
</script>

<style>
	.MenuMain {
		display: flex;
		justify-content: center;
	}
	.MenuMain-item {
		padding: 0 .5rem;
		font-size: 1.25rem;
	}
	.MenuMain-link {
		font-variant-caps: all-small-caps;
		color: white;
		font-weight: bold;
		text-decoration: none;
	}
	.MenuMain-link:focus,
	.MenuMain-link:hover {
		color: greenyellow;
	}
	.wrap {
		margin-left: -100%;
		margin-right: -100%;
		padding: 1rem 100%;
		background-color: lightslategray;
	}
	.inner-wrap {
		display: flex;
		align-items: center;
		width: 100%;
	}
	.logo {
		display: block;
		line-height: 1;
		width: 3rem;
		text-decoration: none;
	}
</style>

<!-- DEBUG -->
<!-- <pre>MenuMain.svelte : items = {JSON.stringify(items, null, 2)}</pre> -->

<div class="wrap">
	<div class="inner-wrap">
		<a class="logo" href="/">
			<img src="/logo.svg" alt="Experimental research journal logo" />
		</a>
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
	</div>
</div>
