<script>
	import Popover from 'svelte-popover';
	export let postures = [];
</script>

<style>
	/* .f-grid {
		--item-width: 2em;
	} */
	.posture {
		position: absolute;
		/* top: var(--y);
		left: var(--x); */
		top: calc(var(--y) + 75px);
		/* left: calc(var(--x) - 150px); */
		left: var(--x);
		/* padding: 1em; */
		font-size: var(--scale);
		width: 300px;
	}
	/* .hexagon {
		--width: 7em;
		--height: 4.25em;
		font-size: calc(var(--score) * 1em + .7rem);
		position: relative;
		display: inline-block;
		margin-top: calc(var(--width) / 4);
		margin-bottom: calc(var(--width) / 4);
		width: var(--width);
		height: var(--height);
		text-align: center;
		font-weight: bold;
		color: white;
		background: var(--bg-color);
	}
	.hexagon::before,
	.hexagon::after {
		content: "";
		position: absolute;
		border-left: calc(var(--width) / 2) solid transparent;
		border-right: calc(var(--width) / 2) solid transparent;
	}
	.hexagon::before {
		left: 0;
		bottom: 100%;
		border-bottom: calc(var(--width) / 4) solid var(--bg-color);
	}
	.hexagon::after {
		left: 0;
		top: 100%;
		border-top: calc(var(--width) / 4) solid var(--bg-color);
	}
	.hexagon-inner-wrap {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: .25rem;
	} */
	[slot="target"] {
		cursor: pointer;
	}
	.pop-content {
    padding: 10px;
		width: 33ch;
    background: #fff;
		color: var(--bg-color);
  }
</style>

<!-- <div class="f-grid f-grid--center"> -->
	{#each postures as posture, i}
		<!-- <div> -->
			<!-- <div class="hexagon" style="--score:{ posture.score / 2000 }; --bg-color:hsla({ Math.round(Math.random() * 360) }, 100%, 30%, 1)"> -->
			<div class="posture" style="--x:{posture.projectedX}px; --y:{posture.projectedY}px; --scale:{posture.projectedScale}em; --bg-color:hsla({ posture.hslaAngle }, 100%, 30%, 1)">
				<!-- <div class="hexagon"> -->
					<!-- <div class="hexagon-inner-wrap"> -->
						<Popover arrowColor="#fff">
							<p slot="target">{ posture.title }</p>
							<dl slot="content" class="pop-content">
								<dt>instruments&nbsp;:</dt>
								<dd>{ posture.instruments }</dd>
								<dt>effets&nbsp;:</dt>
								<dd>{ posture.effets }</dd>
							</dl>
						</Popover>
					<!-- </div> -->
				<!-- </div> -->
			</div>
		<!-- </div> -->
	{/each}
<!-- </div> -->
