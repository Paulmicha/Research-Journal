<script>
	import View from '$lib/components/View.svelte';

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
				sort: "DESC",
				render: 'date'
			},
			// TODO rewrite data model to allow SQL query to get total reactions count
			// i.e. like COUNT(DISTINCT has_reaction.id_document) AS reaction_count
			reactions_qty: {
				hidden: true,
				select: "GROUP_CONCAT(has_reaction.qty, ';') reactions_qty"
			},
			reactions_name: {
				label: "Reactions",
				select: "GROUP_CONCAT(reaction.name, ';') reactions_name",
				sortable: true,
				sort_on: 'reactions_qty'
			},
			title: { label: "Title", href_from: "url", sortable: true },
			tags: { label: "Tags", select: "GROUP_CONCAT(tag.name, ', ') tags" },
			author: {
				label: "Author",
				select: "author.name as author",
				sortable: true
			},
			names: {
				label: "Mentions",
				select: "GROUP_CONCAT(mention.name, ', ') names"
			},
			description: { label: "Description" }
		},
		join: `
			LEFT JOIN has_tag ON document.id = has_tag.id
				AND has_tag.db_table = $t
			LEFT JOIN tag ON has_tag.id_tag = tag.id

			LEFT JOIN has_person as has_author ON document.id = has_author.id
				AND has_author.db_table = $t
				AND has_author.type = $a
			LEFT JOIN person as author ON has_author.id_person = author.id

			LEFT JOIN has_person as has_mention ON document.id = has_mention.id
				AND has_mention.db_table = $t
				AND has_mention.type = $n
			LEFT JOIN person as mention ON has_mention.id_person = mention.id

			LEFT JOIN has_reaction ON document.id = has_reaction.id
				AND has_reaction.db_table = $t
			LEFT JOIN reaction ON has_reaction.id_reaction = reaction.id
		`,
		group_by: "document.id",
		queryArgs: {
			$t: 'document',
			$a: 'author',
			$n: 'mention'
		}
	};
</script>

<View { definition } />
