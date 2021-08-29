/**
 * @file
 * Loosely defines our main entities for the Ecometrics experiment.
 *
 * NB: these are manually entered, bu we still need to map "natural language"
 * location values to our generated location entities ID (i.e. poor man's entity
 * references). Same goes for services referencing other services.
 * @see scripts/experiments/ecometrics/manual-data/services.json
 */

const slugify = require('@sindresorhus/slugify');
const { sortObjectKeys, cyrb53 } = require('../utils');
const { generateLocationID } = require('./location');

// Services could be anything : cloud providers, visio, online tools...
const serviceKeys = [
	"id", // required for entity reference to other services.
	"type", // e.g. 'cloud provider', 'saas', 'paas', 'faas', 'online tool', etc.
	"name",
	"services", // n:n entity reference to other services, e.g. Gitlab's cloud provider.
	"locations" // array of all known or possible locations (n:n entity reference to "location" entities).
];

/**
 * Generates service "fingerprint".
 *
 * @param {Object} service : the entity being created.
 * @return {String} : hopefully stable-ish value to be transformed into a hash.
 */
const getFingerprint = service => slugify(
	`${service.type || ''} ${service.name || ''}`,
	{ separator: '_' }
);

/**
 * Generates unique numerical service IDs.
 *
 * @param {Object} service : the entity being created.
 */
const generateServiceID = service => `${cyrb53(getFingerprint(service))}`.substring(0, 8);

/**
 * Maps a service entity to 1 or more location entities.
 *
 * @param {Object} service the manually entered service data.
 * @returns {Object} the same object with locations referenced by ID.
 */
const serviceNormalizeItem = service => {
	// Normalize keys.
	serviceKeys.forEach(key => {
		// À 2 doigts de réinventer un ORM... Ce qu'on voulait éviter.
		if (key === 'services' || key === 'locations') {
			if (!(key in service)) {
				service[key] = [];
			}
		} else {
			service[key] = `${service[key] || ''}`.trim();
		}
	});

	// Generate the ID.
	service.id = generateServiceID(service);

	// Other services' entity references.
	if (service.services.length) {
		service.services = service.services.map(service => generateServiceID(service));
	}

	// Location entity references.
	if (service.locations.length) {
		service.locations = service.locations.map(loc => generateLocationID(loc));
	} else {
		// When a service uses 1 or more other services which have at least 1
		// location, use those automatically. This requires post-processing.
		if (service.services.length) {
			if (!('postprocess' in service)) {
				service.postprocess = [];
			}
			service.postprocess.push({
				operation: 'append',
				from: 'services.locations',
				to: 'locations'
			});
		} else {
			// By default, always associate the "World" location to at least have an
			// estimate (albeit really approximative) carbon intensity value.
			service.locations = [{
				continent: "World"
			}];
		}
	}

	return sortObjectKeys(service, serviceKeys);
};

/**
 * TODO Implements postProcess callback.
 *
 * @see postProcess() in scripts/experiments/ecometrics/utils.js
 *
 * @param {Object} service : the entity
 * @param {Objects} postprocess : the post processing details
 */
const servicePostprocess = (service, postprocess) => {
	console.log("servicePostprocess()");
	console.log(service);
	console.log(postprocess);
}

module.exports = {
	serviceKeys,
	serviceNormalizeItem,
	servicePostprocess
};
