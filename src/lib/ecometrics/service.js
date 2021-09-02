
/**
 * @file
 * Contains service-related shared utilities for the Ecometrics experiment.
 */

import slugify from '@sindresorhus/slugify';

/**
 * Returns service SVG code according to its type (subcategory).
 *
 * Contains hardcoded mappings to match some service names to particular icons.
 *
 * @param {Object} service : the service entity object.
 * @param {Object} servicesIcons : the loaded data containing inline SVG markup.
 * @return {String} the icon SVG inline markup.
 */
export const getServiceImg = (service, servicesIcons) => {
	if (!servicesIcons) {
		return '';
	}
	let iconName = slugify(service.name, { separator: '' });
	if (iconName.includes('google')) {
		iconName = 'google';
	} else if (iconName.includes('amazon')) {
		iconName = 'aws';
	} else if (iconName.includes('microsoft')) {
		iconName = 'microsoft';
	}
	if (!(iconName in servicesIcons)) {
		return servicesIcons.default;
	}
	return servicesIcons[iconName];
};
