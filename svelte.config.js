/**
 * @file
 * Contains SvelteKit configuration.
 */

import path from 'path';
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		vite: {
			resolve: {
				alias: {
					$content: path.resolve('./content')
				}
			},
			// Workaround ReferenceError: module is not defined
    	// at /node_modules/lodash.deburr/index.js
    	// See https://kit.svelte.dev/faq#packages
    	// See https://vitejs.dev/config/#optimizedeps-include
			optimizeDeps: {
				include: ['lodash.deburr']
			},
			// Workaround error :
			// content/page/index.json?import" is outside of Vite serving allow list
			// See https://github.com/sveltejs/kit/issues/2701
			// kit.vite.server.fs.allow: ['locales']
			server: {
				fs: {
					allow: ['content']
				}
			}
		}
	}
};

export default config;
