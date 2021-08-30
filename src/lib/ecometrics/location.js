
/**
 * @file
 * Contains location-related shared utilities for the Ecometrics experiment.
 */

/**
 * Formats the location entity label.
 */
export const getLocationLabel = location => location && ''
	+ (location.continent || '')
	+ (location.country ? ', ' + location.country : '')
	+ (location.region ? ', ' + location.region : '')
	+ (location.city ? ', ' + location.city : '');
