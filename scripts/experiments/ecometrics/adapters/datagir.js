/**
 * @file
 * Contains utilities to transform raw data from diverse sources.
 */

const { co2EqKeys } = require('../entities/co2Eq');

/**
 * Normalizes co2Eq objects from extracted data sources.
 *
 * @param {Object} input the raw items to normalize.
 * @returns {Object} the correctly formatted object.
 */
const co2EqNormalizeItem = input => {
	const output = {};

	// Example input :
	// {
  //   "id": 32,
  //   "name": {
  //     "fr": "Jour[s] de chauffage (gaz)"
  //   },
  //   "emoji": "🏘️",
  //   "total": 18.63,
  //   "default": true,
  //   "defaultEmbed": true,
  //   "about": "(snip HTML string)"
  // },

	co2EqKeys.forEach(k => {
		if (k in input) {
			output[k] = `${input[k] || ''}`.trim();
		} else {
			switch (k) {
				case 'name_fr':
					output[k] = `${input.name.fr || ''}`.trim();
					break;
			}
		}
	});

	return output;
};

module.exports = {
	co2EqNormalizeItem
};
