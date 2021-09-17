
/**
 * @file
 * Contains device-related shared utilities for the Ecometrics experiment.
 */

import { randomizeArray, displayNb, limitDecimals, getValuePercentInRange } from '../../lib/generic_utils.js';
import { getSelectedItemSetting } from './selection.js';

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
 * @param {Object} devicesIcons : the loaded data containing inline SVG markup.
 * @return {String} the icon SVG inline markup.
 */
export const getDeviceImg = (device, devicesIcons) => {
	if (!devicesIcons) {
		return '';
	}
	if (!(device.subcategory in devicesIcons)) {
		return devicesIcons.default;
	}
	return devicesIcons[device.subcategory];
};

/**
 * Gets the kwh value of given device over given period according to specified
 * hours of use / day.
 *
 * @param {Object} device the entity
 * @param {String} period the currently selected period.
 * @returns {Float}
 */
export const getDeviceKwhPerPeriod = (device, period) => {
	let yearlyKwh = parseInt(device.yearly_kwh);
	// Manual override when user specifies the wh_monthly_average value.
	// @see src/components/experiments/EcoMetricsSelectionSettings.svelte
	if ('selectionSettings' in device && 'wh_monthly_average' in device.selectionSettings) {
		yearlyKwh = parseInt(device.selectionSettings.wh_monthly_average * 12 / 1000);
	}
	const hoursPerDay = parseInt(getSelectedItemSetting(device, 'hours_per_day'));
	const kwhUsedPerDay = (yearlyKwh / 365) * hoursPerDay;
	switch (period) {
		case 'week':
			return kwhUsedPerDay * 7;
		case 'month':
			return kwhUsedPerDay * 365 / 12;
		case 'year':
			return kwhUsedPerDay * 365;
	}
	return kwhUsedPerDay;
};
