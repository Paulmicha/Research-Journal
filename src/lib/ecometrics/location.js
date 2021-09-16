
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
 * Gets location estimated electricity grid carbon intensity (gCO2eq / kWh).
 *
 * @param {Object} location the entity.
 * @param {Array} ci the carbon intensity store containing the list of all
 *   available carbon intensity entities.
 * @param {Array} locations (optional) the location entities to fallback by
 *   country or continent. Defaults to empty array.
 * @returns {Number} the carbon intensity matching given location if found, or
 *   using fallback matches by country or continent or world average, in
 *   gCO2eq / kWh.
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
		if (
			(location.country.length && location.country === locations[j].country)
			|| (location.country_code.length && location.country_code === locations[j].country_code)
		) {
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
		if (location.continent.length && location.continent === locations[j].continent) {
			for (i = 0; i < ci.length; i++) {
				const ciEntity = ci[i];
				if (ciEntity.location === locations[j].id) {
					return parseFloat(ciEntity.carbon_intensity);
				}
			}
		}
	}

	// If nothing else matches, use the World average.
	// See https://github.com/GreenAlgorithms/green-algorithms-tool/raw/master/data/CI_aggregated.csv
	return 475;
};
