/**
 * @file
 * Loosely defines our main entities props for the Ecometrics experiment.
 */

// Services could be anything : cloud providers, visio, online tools...
const servicesKeys = [
	"id",
	"location", // n:1 entity reference to a unique "location" entity
	"name",
	"continent",
	"country",
	"region",
	"city"
];

module.exports = {
	servicesKeys
};
