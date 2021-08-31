
/**
 * @file
 * Contains device-related shared utilities for the Ecometrics experiment.
 */

import { randomizeArray, displayNb, limitDecimals, getValuePercentInRange } from '../../lib/generic_utils.js';

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
 * @param {Object} devicesColNames : labels for all device entity props.
 * @return {Array} of Objects like { label: "Title of value", value: "The value" }.
 */
export const getDeviceInfo = (device, devicesColNames) =>  {
	if (!devicesColNames) {
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
		if (key in device && device[key].length) {
			info.push({
				label: devicesColNames[key] || key,
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
export const getDeviceImg = (device, devicesIcons) => {
	if (!devicesIcons) {
		return '';
	}
	if (!(device.subcategory in devicesIcons)) {
		return devicesIcons.box;
	}
	return devicesIcons[device.subcategory];
};