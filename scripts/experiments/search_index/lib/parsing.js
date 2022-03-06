/**
 * @file
 * Public URLs data miner based on channels exports.
 *
 * @see scripts/experiments/search_index/fetch.sh
 */

import * as fs from 'fs';
import * as path from 'path';
import slugify from '@sindresorhus/slugify';
import { walk } from '../../../fs.js';

// Excluded domains.
const blacklisted = [
	'github.com/Paulmicha/',
	'msc.paulmichalet.com/experiments/msc-search-index',
	'meet.jit.si',
	'docs.google.com',
	'drive.google.com',
	'discord.com/channels',
	'.zoom.',
	'.bbcollab.',
	'.webex.',
	'miro.com',
	'plateau.',
	'-weever.',
	'teams.microsoft.com',
	'goo.gl/maps',
	'esc-clermont.fr',
	'meet.google.com',
	'www.google.com/imgres?',
	'www.google.com/url?'
];

const blacklisted_channels = [
	'778322366161485897',
	'774206981191106580',
	'768541814524870727',
	'781585449646817293',
	'781550948236525598',
	'781475209537388565',
	'781427207662075905',
	'781425172003160074',
	'781222072335859732',
	'781498326435627038',
	'781496743870464000',
	'775704469924347944',
	'777907883488575499',
	'789044194521251841',
	'798136146969362462',
	'796756277790900234',
	'797110410419241002',
	'797820258345811979',
	'798950616801607690',
	'781475209537388565',
	'781427207662075905',
	'781222072335859732',
	'789526835854966805',
	'793515214095122502',
	'789146484645822496',
	'789149506666233886',
	'789146964523876382',
	'789150232931860500',
	'789150924877594664',
	'768497580740837413',
	'812243385716179015',
	'812243423729156106',
	'812243455748866069',
	'812243478439526410',
	'812243502246526976',
	'837294991910764545',
	'833678765930053632',
	'828223525033869334',
	'768506184810364939'
];

const blacklisted_titles = [
	'Log in or sign up to view',
	'Google Docs - create and edit documents online, for free.',
	'Meet Google Drive – One place for all your files',
	'Google Slides - create and edit presentations online, for free.',
	'Franceinfo - Actualités en temps réel et info en direct',
	'Google Sheets - create and edit spreadsheets online, for free.'
];

const irrelevant_channel_names = [
	'partages-ressources'
];

// Titles that are not descriptive are replaced by their fallback (URL).
const titleForceFallback = [
	'Accueil',
	'Log into Facebook',
	'Log into Facebook | Facebook',
	'binge.audio'
];

const token_aliases = {
	"d": "description",
	"desc": "description",
	"content": "description",
	"contenu": "description",
	"p": "date_published",
	"dt": "date_published",
	"t": "tags",
	"tag": "tags",
	"mots-cles": "tags",
	"mot-cle": "tags",
	"a": "author",
	"auteur": "author",
	"auteurs": "author",
	"authors": "author",
	"h": "title",
	"headline": "title",
	"titre": "title",
	"n": "names",
	"nom": "names",
	"noms": "names",
	"name": "names",
	"m": "type",
	"types": "type",
	"support": "type",
	"supports": "type",
	"media": "type",
	"medias": "type"
};

const recognized_types = [
	'article',
	'video',
	'interview',
	'note',
	'extraits',
	'conference',
	'ebook',
	'publication',
	'film',
	'podcast',
	'site-web',
	'debat',
	'revue',
	'tribune',
	'tweet',
	'thread',
	'webinar',
	'replay',
	'paper',
	'pdf',
	'magazine',
	'graph',
	'documentaire'
];

/**
 * Returns "clean" URL from message if it contains any and if not blacklisted.
 *
 * See https://gist.github.com/dperini/729294
 *
 * @returns String|Boolean
 *   False if no URL was found (or if it is blacklisted).
 *   String (the matched URL) otherwise.
 */
const get_url = (text) => {
	const urlRegex = new RegExp(
		"(?:(?:(?:https?|ftp):)?\\/\\/)" +
			// user:pass BasicAuth (optional)
			"(?:\\S+(?::\\S*)?@)?" +
			"(?:" +
				// IP address exclusion
				// private & local networks
				"(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
				"(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
				"(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
				// IP address dotted notation octets
				// excludes loopback network 0.0.0.0
				// excludes reserved space >= 224.0.0.0
				// excludes network & broadcast addresses
				// (first & last IP address of each class)
				"(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
				"(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
				"(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
			"|" +
				// host & domain names, may end with dot
				// can be replaced by a shortest alternative
				// (?![-_])(?:[-\\w\\u00a1-\\uffff]{0,63}[^-_]\\.)+
				"(?:" +
					"(?:" +
						"[a-z0-9\\u00a1-\\uffff]" +
						"[a-z0-9\\u00a1-\\uffff_-]{0,62}" +
					")?" +
					"[a-z0-9\\u00a1-\\uffff]\\." +
				")+" +
				// TLD identifier name, may end with dot
				"(?:[a-z\\u00a1-\\uffff]{2,}\\.?)" +
			")" +
			// port number (optional)
			"(?::\\d{2,5})?" +
			// resource path (optional)
			"(?:[/?#]\\S*)?",
		"i"
	);

	const match = urlRegex.exec(text);

	if (!match || !match[0]) {
		return false;
	}

	for (let i = 0; i < blacklisted.length; i++) {
		if (match[0].includes(blacklisted[i])) {
			return false;
		}
	}

	// When copy/pasting URLs inside parenthesis (or before a comma), the URL gets
	// appended with those -> regex to remove from the end those 2 characters.
	// TODO edge cases to look out for ?
	return match[0].replace(/([\)\.,\s]+$)/g, '');
};

/**
 * Returns object of values defined by our simple token syntax.
 *
 * @return Object
 *
 * @example
 *   // input :
 *   text = "https://www.college-de-france.fr/site/luigi-rizzi/inaugural-lecture-2020-11-05-18h00.htm /tags: video, conférence, linguistique, structures syntaxiques /names: Luigi Rizzi /authors: Collège de France /description: Leçon inaugurale (vidéo d'1h) présentant les travaux de la nouvelle chaire Linguistique générale du Collège de France, confiée au linguiste Luigi Rizzi."
 *   // output :
 *   result = tokenize_message(text)
 *   // -> {
 *     description: "Leçon inaugurale (vidéo d'1h) présentant les travaux de la nouvelle chaire Linguistique générale du Collège de France, confiée au linguiste Luigi Rizzi.",
 *     authors: 'Collège de France',
 *     names: 'Luigi Rizzi',
 *     tags: 'video, conférence, linguistique, structures syntaxiques'
 *   }
 */
const tokenize_message = (text) => {
	let result = {};

	// Start from the end to gradually prune the text up to the first match.
	Array.from(text.matchAll(/\/([^:/]+)\h?:/gmi)).reverse().forEach(match => {
		const token = normalize_token_name(match[1]);
		if (!token) {
			return;
		}
		const to_prune = text.substring(match.index);
		result[token] = to_prune.replace(match[0], '').trim().replace(/(^,)|(,$)/g, "");
		if (!result[token].length) {
			delete result[token];
		}
		text = text.substring(0, match.index);
	});

	return result;
}

/**
 * Normalizes token names.
 *
 * Performs translitteration + lowercase (slugify), and reduce synonyms or
 * aliases to "canonical" values. Filters out invalid values.
 *
 * @example
 *   token = normalize_token_name("DéScriPtion");
 *   // -> "description"
 *
 * @example
 *   token = normalize_token_name("Mots-clés");
 *   // -> "tags"
 */
const normalize_token_name = (token) => {
	token = slugify(token);
	Object.keys(token_aliases).forEach(alias => {
		if (token === alias) {
			token = token_aliases[alias];
		}
	});
	if ([...new Set(Object.values(token_aliases))].includes(token)) {
		return token;
	}
	return false;
}

/**
 * Extracts relations.
 */
const parseReactions = reactions => {
	const result = [];
	reactions.forEach(reaction => {
		if (!reaction.emoji) {
			return;
		}
		result.push({
			name: reaction.emoji.name,
			count: reaction.count
		});
	});
	return result;
};

/**
 * Normalizes types.
 */
const normalizeTypes = doc => {
	const normalized_types = slugify(doc.type);

	doc.type_raw = doc.type;
	doc.type = [];

	recognized_types.forEach(t => {
		if (normalized_types.includes(t)) {
			doc.type.push(t);
		}
	});

	if (!doc.type.length) {
		doc.type.push(normalized_types);
	}

	doc.type = doc.type.join(', ');
};

/**
 * Makes sure there is no line break in the tags extracted value.
 *
 * @param {String} tagStr the CSV value representing tags.
 * @returns {String} beginning of the CSV string up until the 1st line break (if
 *   any).
 */
const cleanTags = tagStr => tagStr
	.split(/\R/)
	.map(s => s.trim())
	.filter(s => s.length)
	.shift();

/**
 * Builds our custom data miner cache.
 */
export const build_channels_urls_index = () => {
	let raw_data;
	const alreadyExtracted = []
	const index = { documents:[] };

	walk('private/channels', '.json').map(file_path => {
		raw_data = JSON.parse(fs.readFileSync(file_path).toString());

		if (blacklisted_channels.includes(raw_data.channel.id)) {
			return;
		}

		raw_data.messages.forEach(message => {
			const url = get_url(message.content);
			if (!url) {
				return;
			}
			// TODO enrich existing object when duplicates are found (instead of
			// skipping).
			if (alreadyExtracted.includes(url)) {
				return;
			}
			alreadyExtracted.push(url);

			message.content = message.content.replace(url, '');

			// First, look for custom tokens (embeds will only provide "fallback"
			// values, see below).
			const doc = tokenize_message(message.content);

			// Remove usual tracking params from URL.
			const urlObj = new URL(url);
			urlObj.searchParams.delete('fbclid');
			urlObj.searchParams.delete('utm_campaign');
			urlObj.searchParams.delete('utm_medium');
			urlObj.searchParams.delete('utm_source');
			urlObj.searchParams.delete('utm_content');
			urlObj.searchParams.delete('ul_campaign');
			urlObj.searchParams.delete('ul_medium');
			urlObj.searchParams.delete('ul_source');
			urlObj.searchParams.delete('ul_content');
			urlObj.searchParams.delete('CMP');
			if (urlObj.hash.startsWith('#nlref=')) {
				urlObj.hash = '';
			}
			doc.url = urlObj.href;

			// Unify channel name and tags. Excludes irrelevant channel names.
			if (!irrelevant_channel_names.includes(raw_data.channel.name)) {
				if (!('tags' in doc)) {
					doc.tags = raw_data.channel.name;
				} else if (!doc.tags.includes(raw_data.channel.name)) {
					doc.tags = `${raw_data.channel.name}, ${cleanTags(doc.tags)}`;
				}
			}

			// Format date shared. TODO publication date ?
			// const d = new Date(message.timestamp);
			// doc.date_shared = `${d.getFullYear()}/${d.getMonth()}/${d.getDate()}`;
			// doc.date_shared = new Date(message.timestamp).toLocaleDateString({
			// 	year: "numeric",
			// 	month: "2-digit",
			// 	day: "2-digit"
			// });
			doc.date_shared = message.timestamp;

			// Extract embeds contents as fallback.
			message.embeds.forEach(embed => {
				if (!('description' in doc)) {
					doc.description = embed.description;
				}
				if (!('author' in doc) && 'author' in embed && 'name' in embed.author) {
					doc.author = embed.author.name;
				}
				if (!('title' in doc)) {
					if ('title' in embed && embed.title.length && !titleForceFallback.includes(embed.title)) {
						doc.title = embed.title;
					} else if ('author' in doc) {
						doc.title = doc.author;
					}
				}
			});

			if (!('title' in doc)) {
				// Exception : Google docs to be shared must define their title via
				// token.
				if (doc.url.includes('docs.google.com')) {
					return;
				}
				doc.title = doc.url.replace(/https?:\/\//, '');
			}

			// Blacklist by title values.
			if (blacklisted_titles.includes(doc.title)) {
				return;
			}

			// Blacklist "bit.ly" URLs with no other data.
			if (doc.title.includes('bit.ly/') && !('tags' in doc) && !('author' in doc) && !('description' in doc)) {
				return;
			}

			// Parses reactions.
			doc.reactions = [];
			if ('reactions' in message) {
				doc.reactions = parseReactions(message.reactions);
			}

			// Normalize types.
			if ('type' in doc) {
				normalizeTypes(doc);
			}

			index.documents.push(doc);
		});
	});

	// Sort by date shared DESC.
	index.documents.sort((a, b) => new Date(b.date_shared).getTime() - new Date(a.date_shared).getTime());

	return index;
};
