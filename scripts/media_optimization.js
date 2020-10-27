/**
 * @file
 * Reduces media files weight.
 */

const { walk } = require('./fs');

/**
 * Overwrites images in place with low quality versions.
 */
const optimize_images_media = () => {
	// TODO [wip] use https://sharp.pixelplumbing.com/api-input
}

module.exports = {
	optimize_images_media
};
