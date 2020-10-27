/**
 * @file
 * Exposes general, public (JSON) data.
 *
 * @see src/routes/[...slug].svelte
 */

const fs = require('fs');

export async function get(req, res, next) {
	const { slug } = req.params;
	const file = 'data/' + slug.join('/') + '.json';

	// Debug.
	// console.log(`src/routes/data/[...slug].json.js : slug = ${slug}`)

	const content_json = fs.readFileSync(file).toString();

	if (content_json) {
		res.writeHead(200, {
			'Content-Type': 'application/json'
		});
		res.end(content_json);
	}
	else {
		res.writeHead(404, {
			'Content-Type': 'application/json'
		});
		res.end(JSON.stringify({
			message: `Not found`
		}));
	}
}
