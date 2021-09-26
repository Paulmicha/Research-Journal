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
			}
		}
	}
};

export default config;
