
/**
 * @file
 * Contains device-related shared utilities for the Ecometrics experiment.
 */

import { deviceStore } from '../../stores/ecometrics.js';

/**
 * Formats given device label.
 *
 * @param {Object} device : the device entity object.
 * @return {String} : the formatted label.
 */
export const getDeviceLabel = device => device.manufacturer + ' ' + device.name;

/**
 * Formats given device info for the side panel details.
 *
 * @param {Object} device : the device entity object.
 * @return {Array} of Objects like { label: "Title of value", value: "The value" }.
 */
export const getDeviceInfo = device =>  {
	if (!deviceStore || !deviceStore.devicesColNames) {
		return '';
	}

	let info = [];
	const keysToRender = [
		"manufacturer",
		"category",
		"subcategory",
		"kg_co2eq",
		"yearly_kwh",
		"use_percent",
		"manufacturing_percent",
		"lifetime",
		"date",
		"error_percent",
		"screen_size",
		"age"
	];

	keysToRender.forEach(key => {
		if (device[key].length) {
			info.push({
				label: deviceStore.devicesColNames[key] || key,
				value: device[key]
			});
		}
	});

	return info;
};

/**
 * Returns device SVG code according to its type (subcategory).
 *
 * @param {Object} device : the device entity object.
 * @return {String} the icon SVG inline markup.
 */
export const getDeviceImg = device => {
	if (!deviceStore || !deviceStore.devicesIcons) {
		return '';
	}
	if (!(device.subcategory in deviceStore.devicesIcons)) {
		return deviceStore.devicesIcons.box;
	}
	return deviceStore.devicesIcons[device.subcategory];
};
