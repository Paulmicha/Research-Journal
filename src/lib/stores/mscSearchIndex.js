import { writable } from 'svelte/store';

export const documentStore = writable({
	totalDocs: 0,
	results: [],
	filters: []
});

// To avoid re-fetching the SQLite database, use a combination of localStorage
// and indexedDB (with the "localforage" package). This creates an offline cache
// which can be busted with the preview data containing a timestamp of the last
// update of the whole dataset.
// @see scripts/experiments/search_index/extract.js
// @see src/components/content/MScSearchIndex.svelte
// TODO incremental updates unless data structure changes are implemented ?
let defaultDocumentCacheStoreVal = {
	unixTime: 0, // In seconds - format : Math.floor(Date.now() / 1000).
	totalDocs: 0
};
const createBrowserDocumentCacheStore = () => {
	// TODO cache busting is done manually for now (renaming the sqlite file and
	// the localStorage name) + need to cleanup the obsolete local storage copy
	// for browsers having already loaded the previous version.
	// @see scripts/experiments/search_index/extract.js
	// @see src/routes/msc-search-index.svelte
	// @see src/lib/components/search_index/MScSearchIndexView.svelte
	const storedVal = localStorage.getItem('mscSearchIndexCacheV3');
	if (storedVal && storedVal.length) {
		defaultDocumentCacheStoreVal = JSON.parse(storedVal);
	}
	const documentCacheStore = writable(defaultDocumentCacheStoreVal);
	documentCacheStore.subscribe(cache => localStorage.setItem(
		// TODO see manual cache busting comment above.
		'mscSearchIndexCacheV3',
		JSON.stringify(cache)
	));
	return documentCacheStore;
};
export const documentCacheStore = typeof localStorage === 'undefined'
  ? writable(defaultDocumentCacheStoreVal)
  : createBrowserDocumentCacheStore();
