import { writable } from 'svelte/store';
// import localforage from 'localforage';

export const documentStore = writable({});

// To avoid re-fetching the SQLite database, use a combination of localStorage
// and indexedDB (with the "localforage" package). This creates an offline cache
// which can be busted with the preview data containing a timestamp of the last
// update of the whole dataset.
// @see scripts/experiments/search_index/extract.js
// @see src/components/content/MScSearchIndex.svelte
// TODO incremental updates unless data structure changes are implemented ?
let defaultDocumentCacheStoreVal = {
	unixTime: 0 // In seconds - format : Math.floor(Date.now() / 1000)
};
const createBrowserDocumentCacheStore = () => {
	const storedVal = localStorage.getItem('mscSearchIndexCache');
	if (storedVal && storedVal.length) {
		defaultDocumentCacheStoreVal = JSON.parse(storedVal);
	}
	const documentCacheStore = writable(defaultDocumentCacheStoreVal);
	documentCacheStore.subscribe(cache => localStorage.setItem(
		'mscSearchIndexCache',
		JSON.stringify(cache)
	));
	return documentCacheStore;
};
export const documentCacheStore = typeof localStorage === 'undefined'
  ? writable(defaultDocumentCacheStoreVal)
  : createBrowserDocumentCacheStore();
