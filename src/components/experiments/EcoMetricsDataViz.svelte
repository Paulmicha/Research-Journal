<script>
	import {
		selectedDeviceStore,
		co2EqStore,
		selectedCo2Eq
	} from '../../stores/ecometrics.js';
	// import Popover from 'svelte-popover';
	import CardBase from '../CardBase.svelte';
	import SidePanel from '../SidePanel.svelte';

	let sidePanelMethods;

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
				result = value / eq.total;
				if (result > 10) {
					result = parseInt(result);
				} else {
					result = result.toFixed(2);
				}
			}
		});
		// if (!isNaN(parseFloat(result)) && isFinite(result)) {
		// 	return result;
		// }
		// return 'No match';
		return result;
	};

	/**
	 * Opens side panel (co2 eq. measure items' click handler).
	 */
	const showCo2EqInfo = (e, co2Eq) => {
		selectedCo2Eq.set(co2Eq);
		sidePanelMethods.open();
	}

</script>

<div class="ecometrics-dataviz">

	<h2>Details</h2>

	<div class="details-zone full-vw fill-h p-h">
		<div class="f-grid f-grid--center f-grid--gutter-l f-grid--vgutter-l">
			{#each $selectedDeviceStore as device}
				<div class="item">

					<CardBase>
						<h3 slot="title">{ device.qty }&nbsp;&times;&nbsp;{ device.label }</h3>
						<div slot="content">
							{#each $co2EqStore as co2Eq}
								<button class="measurement" title={ co2Eq.name_fr } on:click={ e => showCo2EqInfo(e, co2Eq) }>
									{ co2Eq.emoji.trim() }<!--
									-->&nbsp;:&nbsp;<!--
									-->{ getEqCo2(device.device.kg_co2eq * device.qty, co2Eq.id) }
								</button>
							{/each}
							<pre style="font-size:.75rem">{JSON.stringify(device, null, 2)}</pre>
						</div>
					</CardBase>

				</div>
			{/each}
		</div>

		<SidePanel bind:exposedMethods={sidePanelMethods} id="co2-eq-info-panel">
			{#if $selectedCo2Eq && 'about' in $selectedCo2Eq}
				<h2>{ $selectedCo2Eq.emoji }&nbsp;{ $selectedCo2Eq.name_fr }</h2>
				<p>{@html $selectedCo2Eq.about }</p>
			{/if}
		</SidePanel>

	</div>
</div>

<style>
	.p-h {
		padding: 0 var(--space);
	}
	.item {
		max-width: 30ch;
	}
	.measurement {
		padding-right: var(--space-s);
		cursor: pointer;
	}
	.measurement:hover {
		color: cornflowerblue;
	}
	.details-zone {
		position: relative;
	}
</style>
