<script>
	// import { createView } from '$lib/view';
	import View from '$lib/components/View.svelte';
	// import { documentViewStore } from '$lib/stores/mscSearchIndex';
	// documentViewStore.set(createView({
	// 	base_table: 'documents',
	// 	fields: {
	// 		id: { hidden: true },
	// 		url: { hidden: true },
	// 		tags: { label: "Tags" },
	// 		date_shared: { label: "Date shared" },
	// 		description: { label: "Description" },
	// 		author: { label: "Author" },
	// 		title: { label: "Title", href_from: 'url' },
	// 		reactions: { label: "Reactions" }
	// 	}
	// }));
	const definition = {
		db_name: 'search_index',
		base_table: 'documents',
		fields: {
			id: { hidden: true },
			url: { hidden: true },
			tags: { label: "Tags" },
			date_shared: { label: "Date shared" },
			description: { label: "Description" },
			author: { label: "Author" },
			title: { label: "Title", href_from: 'url' },
			reactions: { label: "Reactions" }
		}
	};
</script>

<!-- <View definition={ documentViewStore } /> -->
<View { definition } />
