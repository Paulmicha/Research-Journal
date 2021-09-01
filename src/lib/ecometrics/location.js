
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

/**
 * Gets location estimated electricity grid carbon intensity.
 *
 * @param {Object} location the entity.
 * @param {Array} ci the carbon intensity store containing the list of all
 *  available caron intensity entities.
 * @returns {Number | Boolean} the carbon intensity matching given location if
 *  found, or false.
 */
export const getLocationCarbonIntensity = (location, ci) => {
	for (let i = 0; i < ci.length; i++) {
		const ciEntity = ci[i];
		if (ciEntity.location === location.id) {
			return parseFloat(ciEntity.carbon_intensity);
		}
	}
	return false;
};
