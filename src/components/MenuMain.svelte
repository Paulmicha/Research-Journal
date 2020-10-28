<script>
	export let items = [];
</script>

<style>
	.wrap {
		margin-bottom: 1.5rem;
		padding-top: 1rem;
		padding-bottom: 1rem;
		background-color: var(--color-invert-bg);
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
	.MenuMain {
		display: flex;
		justify-content: space-evenly;
		width: 100%;
	}
	.MenuMain-item {
		padding: 0 .5rem;
		font-size: 1.15rem;
	}
	.MenuMain-link {
		/* font-variant-caps: all-small-caps; */
		text-transform: uppercase;
		letter-spacing: .16ch;
		color: var(--color-invert-link-off);
		/* font-weight: bold; */
		text-decoration: none;
	}
	.MenuMain-link:focus,
	.MenuMain-link:hover,
	.MenuMain-link.is-active {
		color: var(--color-invert-link-on);
	}
</style>

<!-- DEBUG -->
<!-- <pre>MenuMain.svelte : items = {JSON.stringify(items, null, 2)}</pre> -->

<div class="wrap full-vw full-vw--padded">
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
					<a class="MenuMain-link{ is_active ? ' is-active' : '' }" rel=prefetch href="/{ path }" aria-current={ is_active ? "page" : undefined }>
						{ title }
					</a>
				</div>
			{/each}
		</nav>
	</div>
</div>
