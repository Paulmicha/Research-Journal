
/**
 * @file
 * Contains service-related shared utilities for the Ecometrics experiment.
 */

import slugify from '@sindresorhus/slugify';
// import { randomizeArray, displayNb, limitDecimals, getValuePercentInRange } from '../../lib/generic_utils.js';

/**
 * Returns service SVG code according to its type (subcategory).
 *
 * @param {Object} service : the service entity object.
 * @param {Object} servicesIcons : the loaded data containing inline SVG markup.
 * @return {String} the icon SVG inline markup.
 */
export const getServiceImg = (service, servicesIcons) => {
	if (!servicesIcons) {
		return '';
	}
	const iconName = slugify(service.name);
	if (!(iconName in servicesIcons)) {
		return servicesIcons.default;
	}
	return servicesIcons[iconName];
};
