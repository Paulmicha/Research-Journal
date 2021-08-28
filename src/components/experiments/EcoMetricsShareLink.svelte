<script>
	import { route } from '../../stores/route.js';
	import { selectionStore } from '../../stores/ecometrics.js';
	import SidePanel from '../SidePanel.svelte';

	// Sharing link reacts to current selection store.
	let shareLink = '';
	let shareableLinkInput;
	let toasterMethods;

	const oneLetterPropMap = {
		qty: 'q',
		deploys_nb: 'd',
		deploys_duration: 'u',
		backups_nb: 'b',
		backups_duration: 'r',
		hours: 'h'
	};

	selectionStore.subscribe(selection => {

		// TODO includes services.
		// @see src/components/experiments/EcoMetricsUse.svelte
		if (selection.devices.length) {
			const parts = [];

			// TODO reverse proxy... ?
			// shareLink = 'http://' + $route.host + '/' + $route.path + '?s=';
			shareLink = 'https://msc.paulmichalet.com/' + $route.path + '?s=';

			selection.devices.forEach(device => {
				const subParts = [];
				Object.keys(oneLetterPropMap).forEach(k => subParts.push(
					oneLetterPropMap[k] + device[k]
				));
				parts.push(`${device.data.id}:${subParts.join(':')}`);
			});
			shareLink += parts.join(',');
		}
	});

	/**
	 * Copy shareable link button click handler.
	 */
	const copyShareableLink = e => {
		e.preventDefault();
		shareableLinkInput.focus();
    shareableLinkInput.select();
    try {
      document.execCommand('copy');
			toasterMethods.open();
			setTimeout(toasterMethods.close, 3000);
    } catch (err) {
			alert('Something prevents the "copy" action. You will need to copy the link manually.');
			shareableLinkInput.classList.remove('u-sr-only');
		}
	};
</script>

{#if $selectionStore.devices.length || $selectionStore.services.length}
	<button class="btn btn--s"
		on:click={copyShareableLink}
		title="This link contains the current selection. Opening it will preset this page with this list."
	>
		Copy shareable link
	</button>
	(to send this list to someone)
	<input
		class="u-sr-only"
		type="text"
		aria-hidden="true"
		bind:this={shareableLinkInput}
		value="{shareLink}"
	/>
	<SidePanel bind:exposedMethods={toasterMethods} id="toaster" dir="btt" bg="mediumseagreen">
		<div class="u-center">
			<strong>Link copied to clipboard.</strong>
		</div>
	</SidePanel>
{/if}
