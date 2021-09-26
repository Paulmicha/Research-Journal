<article class="c-card fx-focus-shadow--ahf fx-scale-up--ahf">
	{#if $$slots.img}
		<div class="c-card__img">
			<slot name="img" />
		</div>
	{/if}
	<slot name="title" />
	<div class="rich-text">
		<slot name="content" />
	</div>
	<slot name="footer" />
</article>


<style>
	.c-card {
		--fx-shadow-key-umbra-opacity: 0.2;
		--fx-shadow-key-penumbra-opacity: 0.14;
		--fx-shadow-ambient-shadow-opacity: 0.12;
		--fx-shadow-anim-speed: 0.3s;
		--fx-scaling-speed: .1s;
		--fx-scaling-ratio: 1.01;
		position: relative;
		/* margin-top: var(--space); */
		padding: var(--space);
		box-shadow: 0 0 8px rgba(0,0,0,.18),0 8px 16px rgba(0,0,0,.36);
		will-change: transform;
		transition: transform var(--fx-scaling-speed) ease-in-out;
		transform: scale(1, 1);
	}
	.c-card::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: -1;
		opacity: 0;
		will-change: opacity;
		transition: opacity var(--fx-shadow-anim-speed) ease-in-out;
	}
	.c-card:hover,
	.c-card:focus {
		transform: scale(var(--fx-scaling-ratio), var(--fx-scaling-ratio));
	}
	.c-card:hover::after,
	.c-card:focus::after {
		opacity: 1;
	}

	.c-card__img {
		box-shadow: 0 2px 2px 0 rgba(0, 0, 0, var(--fx-shadow-key-penumbra-opacity)),
								0 3px 1px -2px rgba(0, 0, 0, var(--fx-shadow-key-umbra-opacity)),
								0 1px 5px 0 rgba(0, 0, 0, var(--fx-shadow-ambient-shadow-opacity));
		margin-bottom: var(--space);
	}
	:global(.c-card__img img) {
		display: block;
	}
</style>
