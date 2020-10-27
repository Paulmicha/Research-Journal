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

// TODO [wip] https://github.com/matyunya/svelte-image/blob/8c1a038712fc056854a5a4d064c3ab07156965c6/src/main.js#L474
// async function optimize(paths) {
//   const { size } = fs.statSync(paths.inPath);
//   if (options.inlineBelow && size < options.inlineBelow) {
//     return getBase64(paths.inPath, true);
//   }

//   ensureOutDirExists(paths.outDir);

//   await sharp(paths.inPath)
//     .jpeg({ quality: options.quality, progressive: false, force: false })
//     .webp({ quality: options.quality, lossless: true, force: false })
//     .png({ compressionLevel: options.compressionLevel, force: false })
//     .toFile(paths.outPath);

//   return paths.outUrl;
// }

module.exports = {
	optimize_images_media
};
