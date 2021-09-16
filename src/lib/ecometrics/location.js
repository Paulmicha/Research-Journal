
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
 *   available carbon intensity entities.
 * @param {Array} locations (optional) the location entities to fallback by
 *   country or continent. Defaults to empty array.
 * @returns {Number | Boolean} the carbon intensity matching given location if
 *   found, or false.
 */
export const getLocationCarbonIntensity = (location, ci, locations = []) => {
	let i = 0;
	let j = 0;
	for (i = 0; i < ci.length; i++) {
		const ciEntity = ci[i];
		if (ciEntity.location === location.id) {
			return parseFloat(ciEntity.carbon_intensity);
		}
	}
	// Attempt to find fallback value by country.
	for (j = 0; j < locations.length; j++) {
		if (location.country === locations[j].country) {
			for (i = 0; i < ci.length; i++) {
				const ciEntity = ci[i];
				if (ciEntity.location === locations[j].id) {
					return parseFloat(ciEntity.carbon_intensity);
				}
			}
		}
	}
	// Attempt to find fallback value by continent.
	for (j = 0; j < locations.length; j++) {
		if (location.continent === locations[j].continent) {
			for (i = 0; i < ci.length; i++) {
				const ciEntity = ci[i];
				if (ciEntity.location === locations[j].id) {
					return parseFloat(ciEntity.carbon_intensity);
				}
			}
		}
	}
	return false;
};
