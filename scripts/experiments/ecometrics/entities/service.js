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
	"features",
	"services", // n:n entity reference to other services, e.g. Gitlab's cloud provider.
	"locations" // array of all known or possible locations (n:n entity reference to "location" entities).
];

// TODO this entity type uses several array props on its object representation :
// do we uniformize everything by using CSV (e.g. of string values or entity IDs
// for refs) instead ? For now, we leave it like that.
const arrayProps = ["features", "services", "locations"];

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
		// Deal with non-string props.
		if (arrayProps.includes(key)) {
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
			service.postprocess.push('merge locations from services');
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
 * Executes all post-processing operations manually set in the source dataset.
 *
 * @see scripts/experiments/ecometrics/manual-data/services.json
 *
 * @param {Object} data : whole ecometrics dataset, where data.services contains
 *   the list of all processed service entities.
 * @param {Array} googleCloudPlatformCI : carbonIntensity entities from the
 *   processed googleCloudPlatform dataset.
 */
const servicesPostprocess = (data, googleCloudPlatformCI) => {
	data.services = data.services.map(service => {
		if (!('postprocess' in service)) {
			return service;
		}
		service.postprocess.forEach(op => {
			switch (op) {
				case 'append googleCloudPlatformCI locations':
					googleCloudPlatformCI.forEach(ci => {
						if (!service.locations.includes(ci.location)) {
							service.locations.push(ci.location);
						}
					});
					break;
				case 'merge locations from services':
					service.services.forEach(sid => {
						data.services.forEach(entity => {
							if (entity.id === sid) {
								entity.locations.forEach(lid => {
									if (!service.locations.includes(lid)) {
										service.locations.push(lid);
									}
								});
							}
						});
					});
					break;
			}
		});
		delete service.postprocess;
		return service;
	});
}

module.exports = {
	serviceKeys,
	serviceNormalizeItem,
	servicesPostprocess
};
