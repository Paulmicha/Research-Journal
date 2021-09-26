/**
 * @file
 * Contains SvelteKit configuration.
 */

import path from 'path';
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		target: '#svelte',
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
			}
		}
	}
};

export default config;
