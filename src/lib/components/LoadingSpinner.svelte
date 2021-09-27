<script>
	export let size = "1rem";
	export let border = "2px";
	export let color = "cornflowerblue";
	export let speed = ".6s";
	export let voffset = "0";
</script>

<div
	class="spinner"
	aria-hidden="true"
	style="--size:{ size }; --border:{ border }; --color:{ color }; --speed:{ speed }; --voffset:{ voffset }"
></div>

<style>
	@keyframes spinner {
		to { transform: rotate(360deg); }
	}
	.spinner {
		margin: auto;
	}
	.spinner::before {
		content: '';
		box-sizing: border-box;
		position: absolute;
		top: 50%;
		left: 50%;
		width: var(--size);
		height: var(--size);
		margin-top: calc(-1 * var(--size) / 2 + var(--voffset));
		margin-left: calc(-1 * var(--size) / 2);
		border-radius: 50%;
		border-top: var(--border) solid var(--color);
		border-right: var(--border) solid transparent;
		animation: spinner var(--speed) linear infinite;
	}
</style>
