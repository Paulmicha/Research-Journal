<script>
	import { route } from '$lib/stores/route.js';
	import { selectionStore } from '$lib/stores/ecometrics.js';
	import { getSelectedItemDefaultSetting, getSelectedItemSetting, selectionShortenedPropMap } from '$lib/ecometrics/selection.js';
	import SidePanel from '$lib/components/SidePanel.svelte';

	let shareLink = '';
	let shareableLinkInput;
	let toasterMethods;

	// This is for creating the link (encoding).
	// For the decoding :
	// @see src/components/content/DigitalEcoMetricsTool.svelte
	selectionStore.subscribe(selection => {
		let i = 0;
		let parts = [];
		const map = {
			device: 'd',
			service: 's'
		};

		if (selection.device.length || selection.service.length) {
			// TODO reverse proxy... ?
			// let shareLink = 'http://' + $route.host + '/' + $route.path + '?s=';
			shareLink = 'https://msc.paulmichalet.com/' + $route.path + '?s=';

			// Start with the default location (if not "World", which will be selected
			// by default - no need to send it in the URL).
			if (selection.defaultLocation && selection.defaultLocation.id != '10401578') {
				shareLink += 'l' + selection.defaultLocation.id;
				i++;
			}
		} else {
			return '';
		}

		// Process all entities with settings (device + service).
		Object.keys(map).forEach(entityType => {
			if (selection[entityType].length) {
				parts = [];
				selection[entityType].forEach(entity => {
					const subParts = [];
					// Only put the values that are not defaults in URL.
					Object.keys(selectionShortenedPropMap).forEach(k => {
						const val = getSelectedItemSetting(entity, k);
						if (val != getSelectedItemDefaultSetting(entity, k)) {
							// Assume all values that are objects are references to entities
							// which have an ID.
							if (typeof val === 'object' && val !== null) {
								if ('id' in val && `${val.id}` !== '') {
									subParts.push(
										selectionShortenedPropMap[k] + val.id
									);
								}
							} else if (typeof val === 'boolean') {
								subParts.push(
									selectionShortenedPropMap[k] + (val ? '1' : '0')
								);
							} else {
								subParts.push(
									selectionShortenedPropMap[k] + val
								);
							}
						}
					});
					if (subParts.length) {
						parts.push(`${map[entityType]}${entity.id}/${subParts.join('/')}`);
					} else {
						parts.push(`${map[entityType]}${entity.id}`);
					}
				});
				if (i > 0) {
					shareLink += ';';
				}
				shareLink += parts.join(';');
				i++;
			}
		});
	});

	/**
	 * Copy shareable link button click handler.
	 */
	const copyShareableLink = () => {
    try {
			navigator.clipboard.writeText(shareableLinkInput.value)
				.then(() => {
					toasterMethods.open();
					setTimeout(toasterMethods.close, 3000);
				})
				.catch(() => shareableLinkInput.classList.remove('u-sr-only'));
    } catch (err) {
			console.error(err);
			alert('Something prevents the "copy" action. You will need to copy the link manually.');
			shareableLinkInput.classList.remove('u-sr-only');
		}
	};
</script>

{#if $selectionStore.device.length || $selectionStore.service.length}
	<button class="btn btn--s"
		on:click|preventDefault={copyShareableLink}
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
