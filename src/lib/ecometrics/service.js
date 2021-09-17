
/**
 * @file
 * Contains service-related shared utilities for the Ecometrics experiment.
 */

import slugify from '@sindresorhus/slugify';
import { getSelectedItemSetting } from './selection';
import { getPercentValueInRange } from '../generic_utils';

/**
 * Returns service SVG code according to its type (subcategory).
 *
 * Contains hardcoded mappings to match some service names to particular icons.
 *
 * @param {Object} service : the service entity object.
 * @param {Object} servicesIcons : the loaded data containing inline SVG markup.
 * @return {String} the icon SVG inline markup.
 */
export const getServiceImg = (service, servicesIcons) => {
	if (!servicesIcons) {
		return '';
	}
	let iconName = slugify(service.name, { separator: '' });
	if (iconName.includes('google')) {
		iconName = 'google';
	} else if (iconName.includes('amazon')) {
		iconName = 'aws';
	} else if (iconName.includes('microsoft')) {
		iconName = 'microsoft';
	}
	if (!(iconName in servicesIcons)) {
		return servicesIcons.default;
	}
	return servicesIcons[iconName];
};

/**
 * Calculates (wrong) estimates of power consumption based on RAM and CPU stress.
 *
 * "the GHG Protocol is not suitable for customers to assess the emissions of
 * their IT environments located in the public cloud because the required
 * information to calculate emissions is not provided by Cloud Vendors."
 * https://journalofcloudcomputing.springeropen.com/articles/10.1186/s13677-020-00185-8
 *
 * "Even if cloud providers work on Energy-Proportional Computing strategies
 * to minimize wastage, our measurements show that once the instance is
 * available to us its power consumption can be significant, even when idle
 * (power overhead)."
 * See https://medium.com/teads-engineering/estimating-aws-ec2-instances-power-consumption-c9745e347959
 *
 * We make pretty harsh assumptions here to represent something that is
 * apparently impossible to measure due to vendors not having or not releasing
 * the necessary data. Current leads to make our own measures include :
 * - https://github.com/hubblo-org/scaphandre
 * - https://github.com/marmelab/argos
 *
 * @param {Object} selectedService the entity object "decorated" with settings.
 * @returns {Number} total kW/h per month for all settings on given service.
 */
export const estimateCloudConsumption = selectedService => {
	let n = 0;
	let d = 0;
	let totalWattsPerHour = 0;
	let cpuWatts = 0;
	let ramWatts = 0;

	// Manual override when user uses the wh_monthly_average input.
	const whPerMonthOverride = getSelectedItemSetting(selectedService, 'wh_monthly_average');
	if (whPerMonthOverride) {
		return whPerMonthOverride / 1000; // Converted to monthly kilo watts per hour average.
	}

	// We'll use the average gap in W/vCPU measures between idle and 100% from
	// Benjamin Davy's research + the same for W/GB for RAM.
	const awsEc2Measures = {
		cpu: {
			models: ['c5', 'm5', 'r5', 'z1d', 'm5zn'],
			low: [1.18, 1.15, 1.21, 0.99, 1.2],
			high: [4.03, 2.99, 3.61, 10.00, 10.68]
		},
		ram: {
			models: ['c5', 'm5', 'r5', 'z1d', 'm5zn'],
			low: [0.41, 0.26, 0.26, 0.27, 0.43],
			high: [1.16, 0.79, 0.61, 0.67, 0.96]
		}
	};
	awsEc2Measures.cpu.averageLow = awsEc2Measures.cpu.low.reduce((a, b) => a + b) / awsEc2Measures.cpu.low.length;
	awsEc2Measures.cpu.averageHigh = awsEc2Measures.cpu.high.reduce((a, b) => a + b) / awsEc2Measures.cpu.high.length;
	awsEc2Measures.ram.averageLow = awsEc2Measures.ram.low.reduce((a, b) => a + b) / awsEc2Measures.ram.low.length;
	awsEc2Measures.ram.averageHigh = awsEc2Measures.ram.high.reduce((a, b) => a + b) / awsEc2Measures.ram.high.length;

	const ram = getSelectedItemSetting(selectedService, 'ram');
	const vcpu = getSelectedItemSetting(selectedService, 'vcpu');

	// Automated tests.
	if (getSelectedItemSetting(selectedService, 'useTests')) {
		n = getSelectedItemSetting(selectedService, 'tests_per_month');
		d = getSelectedItemSetting(selectedService, 'tests_duration'); // in seconds
		cpuWatts = getPercentValueInRange(
			getSelectedItemSetting(selectedService, 'tests_cpu_stress'),
			awsEc2Measures.cpu.averageLow,
			awsEc2Measures.cpu.averageHigh
		);
		ramWatts = getPercentValueInRange(
			getSelectedItemSetting(selectedService, 'tests_ram_stress'),
			awsEc2Measures.ram.averageLow,
			awsEc2Measures.ram.averageHigh
		);
		totalWattsPerHour += vcpu * (n / 4 / 7 / 24) * (d / 3600) * cpuWatts;
		totalWattsPerHour += ram * (n / 4 / 7 / 24) * (d / 3600) * ramWatts;
	}

	// Backup.
	if (getSelectedItemSetting(selectedService, 'useBackup')) {
		n = getSelectedItemSetting(selectedService, 'backups_per_month');
		d = getSelectedItemSetting(selectedService, 'backups_duration'); // in seconds
		cpuWatts = getPercentValueInRange(
			getSelectedItemSetting(selectedService, 'backups_cpu_stress'),
			awsEc2Measures.cpu.averageLow,
			awsEc2Measures.cpu.averageHigh
		);
		ramWatts = getPercentValueInRange(
			getSelectedItemSetting(selectedService, 'backups_ram_stress'),
			awsEc2Measures.ram.averageLow,
			awsEc2Measures.ram.averageHigh
		);
		totalWattsPerHour += vcpu * (n / 4 / 7 / 24) * (d / 3600) * cpuWatts;
		totalWattsPerHour += ram * (n / 4 / 7 / 24) * (d / 3600) * ramWatts;
	}

	// Hosting.
	if (getSelectedItemSetting(selectedService, 'useHost')) {
		cpuWatts = getPercentValueInRange(
			getSelectedItemSetting(selectedService, 'hosting_cpu_stress'),
			awsEc2Measures.cpu.averageLow,
			awsEc2Measures.cpu.averageHigh
		);
		ramWatts = getPercentValueInRange(
			getSelectedItemSetting(selectedService, 'hosting_ram_stress'),
			awsEc2Measures.ram.averageLow,
			awsEc2Measures.ram.averageHigh
		);
		// WIP assume baremetal or dedicated instances will have bigger impacts.
		// TODO use a different approach (else how would we factor serverless
		// functions, jamstack / static sites...)
		if (getSelectedItemSetting(selectedService, 'hosting_is_baremetal')) {
			cpuWatts = cpuWatts * 5;
			ramWatts = cpuWatts * 5;
		}
		if (getSelectedItemSetting(selectedService, 'hosting_is_dedicated')) {
			cpuWatts = cpuWatts * 2;
			ramWatts = cpuWatts * 2;
		}
		totalWattsPerHour += vcpu * cpuWatts;
		totalWattsPerHour += ram * ramWatts;
	}

	// Convert Watts to kWh/month.
	return totalWattsPerHour / 1000 // in kilowatts
		* 24 // per day
		* 365 / 12; // per month
};

/**
 * Estimates electricity intensity of transmission networks.
 *
 * (Excluding data centers and edge devices)
 *
 * "estimate of 0.06 kWh/GB for 2015 is a new estimate proposed in this study,
 * based on Krug and colleagues (2014) with updated data for 2015 from Krug
 * (2016). kWh/GB = kilowatt-hours per gigabyte."
 * See https://onlinelibrary.wiley.com/doi/full/10.1111/jiec.12630
 *
 * "However, this only considers external traffic on the internet – it does not
 * account for internal network traffic which makes up a significant amount of
 * data transfer and is doubling every 12–15  months. Mobile traffic is another
 * significant exclusion when 71% of the global population expected to have
 * mobile connectivity by 2023 and smartphone traffic growing 7% annually."
 * See https://journalofcloudcomputing.springeropen.com/articles/10.1186/s13677-020-00185-8
 *
 * @param {Object} selectedService the entity object "decorated" with settings.
 * @returns {Number} kwh per month.
 */
export const estimateDataTransferConsumption = selectedService => {
	let s = 0;
	let n = 0;
	let kwhPerMonth = 0;

	// We still have to account for "non-backup" services which use online storage
	// as it's often the only metric we can (wrongfully) estimate.
	// TODO single source of truth for conditional settings such as :
	// @see entityUsesOnlineStorage() in src/components/experiments/EcoMetricsSelectionSettings.svelte
	if (getSelectedItemSetting(selectedService, 'useBackup')) {
		s = getSelectedItemSetting(selectedService, 'backups_total_size'); // in Mo
		n = getSelectedItemSetting(selectedService, 'backups_per_month');
		kwhPerMonth += 0.06 * s / 1024 * n;
	} else if (
		'features' in selectedService
		&& (selectedService.features.includes('storage'))
	) {
		s = getSelectedItemSetting(selectedService, 'weekly_transfer_average'); // in Mo per month
		kwhPerMonth += 0.06 * s / 1024;
	}

	return kwhPerMonth;
};

/**
 * Gets the kwh values of given service over given period.
 *
 * @param {Object} selectedService the entity object "decorated" with settings.
 * @param {String} period the currently selected period.
 * @returns {Object} containing all (wrong) estimates - e.g. :
 *   { cloud: 1.23, transfer: 4.56 }
 */
export const getServiceKwhPerPeriodEstimates = (selectedService, period) => {
	const estimates = {
		cloud: 0,
		transfer: 0
	};
	let kwhUsedPerMonth = 0;

	// Cloud estimates.
	kwhUsedPerMonth = estimateCloudConsumption(selectedService);
	if (kwhUsedPerMonth > 0) {
		switch (period) {
			case 'day':
				estimates.cloud = kwhUsedPerMonth * 12 / 365;
				break;
			case 'week':
				estimates.cloud = kwhUsedPerMonth / 4;
				break;
			case 'month':
				estimates.cloud = kwhUsedPerMonth;
				break;
			case 'year':
				estimates.cloud = kwhUsedPerMonth * 12;
				break;
		}
	}

	// Data transfer estimates.
	kwhUsedPerMonth = estimateDataTransferConsumption(selectedService);
	if (kwhUsedPerMonth > 0) {
		switch (period) {
			case 'day':
				estimates.transfer = kwhUsedPerMonth * 12 / 365;
				break;
			case 'week':
				estimates.transfer = kwhUsedPerMonth / 4;
				break;
			case 'month':
				estimates.transfer = kwhUsedPerMonth;
				break;
			case 'year':
				estimates.transfer = kwhUsedPerMonth * 12;
				break;
		}
	}

	return estimates;
};
