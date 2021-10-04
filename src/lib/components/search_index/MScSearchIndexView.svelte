<script>
	import { displayNb } from '$lib/generic_utils';
	import { documentCacheStore } from '$lib/stores/mscSearchIndex';
	import View from '$lib/components/View.svelte';
	import searchIndexPreviewData from '$content/search_index_preview.json';

	export let pagerPos;
	let viewStore;

	// TODO (wip) this is a mockup for what the hypothetical implementation of
	// such an abstraction might look like.
	// @see src/lib/view.js
	const definition = {
		id: 1,
		db_name: 'search_index',
		base_table: 'document',
		fields: {
			id: { hidden: true },
			url: { hidden: true },
			date_shared: {
				label: "Date shared",
				sortable: true,
				sort_dir: "DESC",
				sort_active: true,
				render: 'date'
			},
			// TODO rewrite data model to allow SQL query to get total reactions count
			// i.e. like COUNT(DISTINCT has_reaction.id_document) AS reaction_count
			reactions_qty: {
				hidden: true,
				select: "GROUP_CONCAT(has_reaction.qty, ' ') reactions_qty"
			},
			reactions_name: {
				label: "Reactions",
				select: "GROUP_CONCAT(reaction.name, ' ') reactions_name",
				sortable: true,
				sort_dir: "DESC",
				sort_on: 'reactions_qty'
			},
			title: { label: "Title", href_from: "url", sortable: true },
			tags: { label: "Tags", select: "GROUP_CONCAT(tag.name, ', ') tags" },
			author: {
				label: "Author",
				select: "author.name as author",
				sortable: true,
				sort_dir: "ASC"
			},
			names: {
				label: "Mentions",
				select: "GROUP_CONCAT(mention.name, ', ') names"
			},
			description: {
				label: "Description",
				class: "wide"
			}
		},
		joins: {
			tag: `
				LEFT JOIN has_tag ON document.id = has_tag.id
					AND has_tag.db_table = $t
				LEFT JOIN tag ON has_tag.id_tag = tag.id
			`,
			person: `
				LEFT JOIN has_person as has_author ON document.id = has_author.id
					AND has_author.db_table = $t
					AND has_author.type = $a
				LEFT JOIN person as author ON has_author.id_person = author.id

				LEFT JOIN has_person as has_mention ON document.id = has_mention.id
					AND has_mention.db_table = $t
					AND has_mention.type = $n
				LEFT JOIN person as mention ON has_mention.id_person = mention.id
			`,
			reaction: `
				LEFT JOIN has_reaction ON document.id = has_reaction.id
					AND has_reaction.db_table = $t
				LEFT JOIN reaction ON has_reaction.id_reaction = reaction.id
			`
		},
		group_by: "document.id",
		queryArgs: {
			$t: 'document',
			$a: 'author',
			$n: 'mention'
		},
		filters: {
			reaction: {
				label: "Filter by emoji",
				select: true,
				multi: true,
				wrapper_class: "narrow",
				type: "swap join",
				placeholder: "$reactions_ids",
				query: `
					INNER JOIN has_reaction ON document.id = has_reaction.id
						AND has_reaction.db_table = $t
						AND has_reaction.id_reaction IN ($reactions_ids)
					INNER JOIN reaction ON has_reaction.id_reaction = reaction.id
				`
			},
			tag: {
				label: "Filter by tags",
				select: true,
				multi: true,
				type: "swap join",
				placeholder: "$tags_ids",
				query: `
					INNER JOIN has_tag ON document.id = has_tag.id
						AND has_tag.db_table = $t
						AND has_tag.id_tag IN ($tags_ids)
					INNER JOIN tag ON has_tag.id_tag = tag.id
				`
			},
			person: {
				label: "Filter by names",
				select: true,
				multi: true,
				type: "new join",
				placeholder: "$persons_ids",
				query: `
					INNER JOIN has_person ON document.id = has_person.id
						AND has_person.db_table = $t
						AND has_person.id_person IN ($persons_ids)
					INNER JOIN person ON has_person.id_person = person.id
				`
			}
		}
	};

	// TODO (wip) implement reloading when a newer version of the remote dataset
	// exists + need to clear $documentCacheStore.totalDocs when reloading.
	$: if (viewStore) {
		viewStore.subscribe(view => {
			if (
				view?.pager?.total_results_nb
				&& $documentCacheStore.totalDocs === 0
			) {
				documentCacheStore.update(o => {
					if (!o.unixTime) {
						o.unixTime = Math.floor(Date.now() / 1000);
					}
					o.totalDocs = view.pager.total_results_nb;
					return o;
				});
			}
		});
	}
</script>

<p class="u-m-b u-fs-s">
	⚠️&nbsp;Proof of concept : the SQLite search index database is loaded in your web browser. No queries involve roundtrips to the server for filtering, paging, or even visiting this page again.
</p>

{#if $documentCacheStore.unixTime && $documentCacheStore.unixTime < searchIndexPreviewData.unixTime}
	<details>
		<summary>Update available</summary>
		The dataset has changed since your last visit.

		<!-- TODO (wip) -->
		<!-- on:click|preventDefault={ reload } -->
		<button class="btn load u-m-b">
			Download the update ({ displayNb(searchIndexPreviewData.total) }&nbsp;ko)
		</button>
	</details>
{/if}

<View { definition } { pagerPos } bind:store={ viewStore } />

<section class="rich-text">
	<h2>Sources</h2>
	<ul>
		<li>
			<a href="https://webreflection.medium.com/a-persistent-sqlite-for-the-web-90083827d1f8" target="_blank">A persistent SQLite for the Web, 2021/01/11, Andrea Giammarchi</a>
		</li>
		<li>
			<a href="https://willschenk.com/articles/2021/sq_lite_in_the_browser/" target="_blank">SQLite in the browser, 2021/04/15, Will Schenk</a>
		</li>
		<li>
			For larger databases like the <a href="https://github.com/phiresky/world-development-indicators-sqlite/" target="_blank">World Development Indicators dataset</a> - a dataset with 6 tables and over 8 million rows (670 MiByte total), Phiresky implemented a virtual file system that fetches chunks of the database with HTTP Range requests when SQLite tries to read from the filesystem&nbsp;: <a href="https://github.com/phiresky/sql.js-httpvfs" target="_blank">sql.js-httpvfs</a>, see&nbsp;: <a href="https://phiresky.github.io/blog/2021/hosting-sqlite-databases-on-github-pages/" target="_blank">Hosting SQLite databases on Github Pages, 2021/04/17, Phiresky</a>
		</li>
	</ul>
</section>
