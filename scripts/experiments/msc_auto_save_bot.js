/**
 * @file
 * Public URLs data miner based on channels exports.
 *
 * @see scripts/experiments/msc_auto_save_bot.sh
 */

const fs = require('fs');
const { walk, write_file } = require('../fs');

/**
 * Builds our custom data miner cache.
 *
 * WIP : for now, extract embeds only.
 */
const build_channels_urls_index = () => {
	let raw_data;
	const alreadyExtracted = []
	const index = { documents:[] };
	const blacklisted = [
		'docs.google.com',
		'drive.google.com',
		'.zoom.',
		'.webex.',
		'-weever.'
	];
	const titleForceFallback = [
		'Accueil',
		'binge.audio'
	];

	walk('private/channels', '.json').map(file_path => {
		raw_data = JSON.parse(fs.readFileSync(file_path).toString());
		raw_data.messages.forEach(message => {

			// WIP : for now, extract embeds contents only.
			message.embeds.forEach(embed => {
				if (alreadyExtracted.includes(embed.url)) {
					return;
				}
				for (let i = 0; i < blacklisted.length; i++) {
					if (embed.url.includes(blacklisted[i])) {
						return;
					}
				}

				const doc = {
					"channel": raw_data.channel.name,
					"url": embed.url,
					"description": embed.description,
				};

				if ('author' in embed && 'name' in embed.author) {
					doc.author = embed.author.name
				}

				if ('title' in embed && embed.title.length && !titleForceFallback.includes(embed.title)) {
					doc.title = embed.title
				} else if ('author' in doc) {
					doc.title = doc.author
				} else {
					doc.title = doc.url.replace('https://', '')
				}

				index.documents.push(doc)
				alreadyExtracted.push(doc.url)
			})
		});
	});

	return index;
};

try {
	write_file(
		'static/data/entities/experiment/channels_urls.json',
		JSON.stringify(build_channels_urls_index())
	);
} catch (error) {}
