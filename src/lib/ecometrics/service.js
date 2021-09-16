
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
 * @returns {Number} total kW/h for all settings on given service.
 */
export const estimateCloudConsumption = selectedService => {
	let n = 0;
	let d = 0;
	let totalWattsPerHour = 0;

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

	// Arbitrary values we'll use for making (wrong) estimates.
	const cpuWattsAt66percent = getPercentValueInRange(
		66,
		awsEc2Measures.cpu.averageLow,
		awsEc2Measures.cpu.averageHigh
	);
	const ramWattsAt66percent = getPercentValueInRange(
		66,
		awsEc2Measures.ram.averageLow,
		awsEc2Measures.ram.averageHigh
	);
	const cpuWattsAt20percent = getPercentValueInRange(
		20,
		awsEc2Measures.cpu.averageLow,
		awsEc2Measures.cpu.averageHigh
	);
	const ramWattsAt20percent = getPercentValueInRange(
		20,
		awsEc2Measures.ram.averageLow,
		awsEc2Measures.ram.averageHigh
	);

	// Automated tests : 66% ressources used ?
	if (getSelectedItemSetting(selectedService, 'useTests')) {
		n = getSelectedItemSetting(selectedService, 'tests_per_month');
		d = getSelectedItemSetting(selectedService, 'tests_duration'); // in seconds
		totalWattsPerHour += vcpu * (n / 4 / 7 / 24) * (d / 3600) * cpuWattsAt66percent;
		totalWattsPerHour += ram * (n / 4 / 7 / 24) * (d / 3600) * ramWattsAt66percent;
	}

	// Backup : 20% ressources ?
	if (getSelectedItemSetting(selectedService, 'useBackup')) {
		n = getSelectedItemSetting(selectedService, 'backups_per_month');
		d = getSelectedItemSetting(selectedService, 'backups_duration'); // in seconds
		totalWattsPerHour += vcpu * (n / 4 / 7 / 24) * (d / 3600) * cpuWattsAt20percent;
		totalWattsPerHour += ram * (n / 4 / 7 / 24) * (d / 3600) * ramWattsAt20percent;
	}

	// Hosting a webserver in the cloud implies at least a fraction of potentially
	// mostly "idle" 24/7 power consumption.
	// Even if it may depend on virtualized "colocation" where many "served"
	// projects share the same ressources, it's not 0. But it's a pretty difficult
	// thing to estimate. We can't generalize how virtual or physical ressources
	// are allocated for all services we try to asses here (i.e. shared hosting,
	// dedicated, baremetal, virtualized)...
	// So the (wrong) estimate we're using here assumes 1/4 vCPU and 1/4 Gb RAM in
	// fulltime "idle" state as the baseline for a single "webserver" service.
	if (getSelectedItemSetting(selectedService, 'useHost')) {
		totalWattsPerHour += 3600 * awsEc2Measures.cpu.averageLow / 4;
		totalWattsPerHour += 3600 * awsEc2Measures.ram.averageLow / 4;
	}

	// Convert watts to kilowatts (per hour).
	return totalWattsPerHour / 1000;
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

	if (getSelectedItemSetting(selectedService, 'useBackup')) {
		s = getSelectedItemSetting(selectedService, 'backups_total_size'); // in Mo
		n = getSelectedItemSetting(selectedService, 'backups_per_month');
		kwhPerMonth += 0.06 * s / 1024 * n;
	}

	return kwhPerMonth;
};

/**
 * TODO aggregate all available estimates into a single result.
 *
 * @param {Object} selectedService the entity object "decorated" with settings.
 */
export const esimateServiceConsumption = selectedService => {};
