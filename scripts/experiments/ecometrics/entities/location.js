/**
 * @file
 * Loosely defines our main entities props for the Ecometrics experiment.
 */

// Basic location entity to link carbon intensity data with cloud providers,
// services and devices use.
const locationKeys = [
	"id",
	"country_code",
	"continent",
	"country",
	"region",
	"city"
];

module.exports = {
	locationKeys
};
