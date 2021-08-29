/**
 * @file
 * Loosely defines our main entities for the Ecometrics experiment.
 */

// This flattens the datagir data, almost used "as is".
// See https://github.com/datagir/monconvertisseurco2/blob/master/public/data/equivalents.json
const co2EqKeys = [
	"id",
	"name_fr",
	"emoji",
	"total",
	"about"
];

module.exports = {
	co2EqKeys
};
