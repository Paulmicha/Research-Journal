#!/usr/bin/env bash

##
# Fetches and prepares data sources for the "Ecometrics" experiment.
#
# @example
#		# From project docroot :
#		scripts/experiments/ecometrics/fetch.sh
#   # Results :
#		# - static/data/ecometrics.json
#		# - static/data/ecometrics.sqlite
#

##
# Only downloads given file if it does not already exist locally.
#
function downloadOnce() {
	local url="$1"
	local fileName="$2"
	local dirName="$3"

	if [[ -z "$url" ]]; then
		return 1
	fi
	if [[ -z "$fileName" ]]; then
		fileName="${url##*/}"
	fi
	if [[ -z "$dirName" ]]; then
		dirName='footprint-data'
	fi

	if [[ ! -f "private/$dirName/$fileName" ]]; then
		echo "Downloading $fileName ..."
		wget "$url" -O "private/$dirName/$fileName"
	else
		echo "The file 'private/$dirName/$fileName' already exists."
	fi
}

# Download the environmental footprint data from Boavizta.
# See https://github.com/Boavizta/environmental-footprint-data
if [[ ! -d 'private/footprint-data' ]]; then
	echo "Creating local dir 'private/footprint-data'..."
	mkdir -p 'private/footprint-data'
fi

downloadOnce 'https://github.com/Boavizta/environmental-footprint-data/raw/main/boavizta-data-fr.csv'
downloadOnce 'https://github.com/Boavizta/environmental-footprint-data/raw/main/boavizta-data-us.csv'

# Download the regional grid carbon intensity from "Green Algorithms".
downloadOnce 'https://github.com/GreenAlgorithms/green-algorithms-tool/raw/master/data/CI_aggregated.csv'

# Download the regional grid carbon intensity from "Google Cloud Platform".
downloadOnce \
	'https://github.com/GoogleCloudPlatform/region-carbon-info/raw/main/data/yearly/2020.csv' \
	'GoogleCloudPlatform-region-carbon-info-2020.csv'

# Download the CO2 equivalences from datagir.
# See https://github.com/datagir/monconvertisseurco2
if [[ ! -d 'private/co2-eq' ]]; then
	echo "Creating local dir 'private/co2-eq'..."
	mkdir -p 'private/co2-eq'
fi

downloadOnce \
	'https://github.com/datagir/monconvertisseurco2/raw/master/public/data/equivalents.json' \
	'equivalents.json' \
	'co2-eq'

## Transform sources into a single static asset.
node scripts/experiments/ecometrics/extract.js

echo "Done."
