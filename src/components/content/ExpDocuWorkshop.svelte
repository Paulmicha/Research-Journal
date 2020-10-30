<script>
	// import { spring } from 'svelte/motion';
	import { route } from '../../stores/route.js';
	// import { derived } from 'svelte/store';
	import { writable } from 'svelte/store';
	import Popover from 'svelte-popover';
	import Postures from '../experiments/Postures.svelte';
	// import Scene from '../perspective_2d/Scene.svelte';

	// Tests WIP.
	// let coords = spring({ x: 50, y: 50 }, {
	// 	stiffness: 0.03,
	// 	damping: 0.15
	// });

	let partial_weight = 0;
	let informel_weight = 0;
	let conflictuel_weight = 0;

	const get_score = (posture) => partial_weight * posture.partial + informel_weight * posture.informel + conflictuel_weight * posture.conflictuel;

	const posturesStore = writable([]);

	// Init custom data.
	let postures = [];
	route.subscribe(o => {
		if (o.data) {
			postures = o.data.postures.items;
			postures.forEach(posture => {
				posture.score = get_score(posture);
			});
			posturesStore.update(() => postures);
		}
	});

	// const postures = derived(route, $route => ($route.data && $route.data.postures && $route.data.postures.items) ? $route.data.postures.items.map(posture => get_score(posture)) : []);

	// let postures;
	// const postures = derived(route, $route => []);
	// const postures = writable([]);

	// route.subscribe(o => {
	// 	if (o.data) {
	// 		// postures = derived(route, $route => $route.data.postures.items.map(posture => get_score(posture)));
	// 		// postures = derived(route, $route => o.data.postures.items.map(posture => get_score(posture)));
	// 		// console.log(o.data.postures.items.map(posture => get_score(posture)))
	// 		postures.update(existing => o.data.postures.items.map(posture => get_score(posture)));
	// 	}
	// });

	// console.log($postures);

	// Manipulation : weighted criterias impacting a single score, then used to
	// scale up or down the items.
	// const scores = writable([]);

	// $: postures.forEach(posture => {
	// 	posture.score = get_score(posture)
	// });

	const onWeightUpdate = (e) => {
		const inputRange = e.target;
		const value = inputRange.value;

		switch(inputRange.id) {
			case 'partial_weight':
				partial_weight = value;
				break;
			case 'informel_weight':
				informel_weight = value;
				break;
			case 'conflictuel_weight':
				conflictuel_weight = value;
				break;
		}

		postures.forEach(posture => {
			posture.score = get_score(posture);
		});
		posturesStore.update(() => postures);
		// console.log(`score of 1st posture : ${postures[1].score}`);
	}

	console.log($posturesStore);

	posturesStore.subscribe(posturesStoreValues => {
		posturesStoreValues[1] && console.log(`test 2 - score of 1st posture : ${posturesStoreValues[1].score}`);
	});
</script>

<style>
	.wrap {
		flex-grow: 1;
		text-align: center;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	/* .mouse-tracker {
		position: absolute;
		left: var(--x);
		top: var(--y);
	}
	.dot {
		height: 1rem;
		width: 1rem;
		background-color: #bbb;
		border-radius: 50%;
		display: inline-block;
	} */
	.controls {
		font-size: .75rem;
		margin: 1rem 0;
	}
	.controls.f-grid {
		flex-wrap: nowrap;
	}
	.controls > * {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.controls > * > * {
		padding: 0 .5rem;
		text-align: center;
	}
	.controls input {
		display: inline-block;
	}
	.controls input[type="text"] {
		max-width: 2rem;
	}
</style>

<h2>Test WIP</h2>

<!-- Debug. -->
<!-- <pre>src/components/content/ExpDocuWorkshop.svelte : $route = {JSON.stringify($route, null, 2)}</pre> -->
<!-- <pre>src/components/content/ExpDocuWorkshop.svelte : postures = {JSON.stringify(postures, null, 2)}</pre> -->

<div class="controls f-grid">
	<div>
		<span>partial</span>
		<span>
			<input type="text" bind:value={ partial_weight } />
			<!-- <input type="range" bind:value={ partial_weight } /> -->
			<input type="range" on:input={ onWeightUpdate } id="partial_weight" />
		</span>
		<span>impartial</span>
	</div>
	<div>
		<span>informel</span>
		<span>
			<input type="text" bind:value={ informel_weight } />
			<!-- <input type="range" bind:value={ informel_weight } /> -->
			<input type="range" on:input={ onWeightUpdate } id="informel_weight" />
		</span>
		<span>formel</span>
	</div>
	<div>
		<span>conflictuel</span>
		<span>
			<input type="text" bind:value={ conflictuel_weight } />
			<!-- <input type="range" bind:value={ conflictuel_weight } /> -->
			<input type="range" on:input={ onWeightUpdate } id="conflictuel_weight" />
		</span>
		<span>consensuel</span>
	</div>
</div>

<hr class="full-vw" />
<div class="wrap full-vw">
<!-- <div class="wrap full-vw" on:mousemove="{ e => coords.set({ x: e.clientX, y: e.clientY }) }"> -->

	<!-- <Postures bind:partial_weight={ partial_weight } bind:informel_weight={ informel_weight } bind:conflictuel_weight={ conflictuel_weight } /> -->
	<!-- <Postures {$postures} /> -->
	<!-- <Postures { postures } /> -->
	<!-- <Postures bind:postures={ postures } /> -->
	<Postures postures={$posturesStore} />

	<!-- Tests WIP. -->
	<!-- <div
		class="mouse-tracker dot"
		style="--x:calc({ $coords.x }px - .5rem); --y:calc({ $coords.y }px - .5rem);"
	>
	</div> -->

	<!-- <Scene /> -->
</div>
