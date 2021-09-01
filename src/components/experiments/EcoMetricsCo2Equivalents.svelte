<script>
	import { displayNb } from '../../lib/generic_utils.js';
	import { co2EqStore } from '../../stores/ecometrics.js';

	export let totalKgEqCo2 = 0;

	/**
	 * Gets the KgEqCO2 of given equivalent measurement.
	 *
	 * @see scripts/experiments/ecometrics/fetch.sh
	 * @see private/co2-eq/equivalents.json
	 *
	 * @example
	 * 	// Apple 13-inch MacBook Pro 4 Thunderbolt 3 ports with 1TB (= 298 kg) :
	 * 	// How many Km by Car can I make for what it cost to build it ?
	 * 	km = getEqCo2(298, '🚗'); // We can use emojis (with quotes) !
	 * 	// Or :
	 * 	km = getEqCo2(298, 27976); // 27976 is the ID of the "Car" measurement.
	 */
	const getEqCo2 = (value, measurement) => {
		let result = false;
		$co2EqStore.forEach(eq => {
			if (eq.id === measurement || eq.emoji === measurement) {
				result = displayNb(value / eq.total);
			}
		});
		return result;
	};
</script>

<div class="details-zone full-vw fill-h">
	<div class="f-grid f-grid--g">
		{#each $co2EqStore as co2Eq}
			<div class="item">
				<h3>
					<span class="co2eq-emoji" aria-hidden="true">{ co2Eq.emoji.trim() }</span>
					<span>
						{ getEqCo2(totalKgEqCo2, co2Eq.id) }&nbsp;{ co2Eq.name_fr }
					</span>
				</h3>
				<div>
					<p>{@html co2Eq.about }</p>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.item {
		border: 1px solid gray;
		margin-right: -1px;
		margin-bottom: -1px;
		max-width: 38ch;
		font-size: .9rem;
	}
	.item h3 {
		margin-top: 0;
		display: flex;
		align-items: center;
	}
	.co2eq-emoji {
		margin-right: var(--space);
		font-size: 2.15em;
	}
	.details-zone {
		position: relative;
	}
	.details-zone .f-grid {
		--gutter: 1.66em;
	}
</style>
