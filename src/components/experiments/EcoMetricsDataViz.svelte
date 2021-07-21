<script>
	import {
		selectedDeviceStore,
		co2EqStore,
		co2EqBySelectedDeviceStore
	} from '../../stores/ecometrics.js';
	import CardBase from '../CardBase.svelte';

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
				// result = (value / eq.total).toFixed(2);
				result = parseInt(value / eq.total);
			}
		});
		// if (!isNaN(parseFloat(result)) && isFinite(result)) {
		// 	return result;
		// }
		return result;
	};

</script>

<div class="full-vw fill-h">
	<div class="f-grid f-grid--center f-grid--gutter-l f-grid--vgutter-l">
		{#each $selectedDeviceStore as device}
			<div class="item">
				<CardBase>
					<span slot="title">{ device.label }</span>
					<div slot="content">
						{#each $co2EqStore as co2Eq}
							<span class="measurement" title={ co2Eq.name.fr }>
								{ co2Eq.emoji.trim() }&nbsp;:&nbsp;{ getEqCo2(device.device.kg_co_2eq_total, co2Eq.id) }
							</span>
						{/each}
					</div>
				</CardBase>
			</div>
		{/each}
	</div>
</div>

<style>
	.item {
		max-width: 30ch;
	}
	.measurement {
		padding-right: var(--space-s);
	}
</style>
