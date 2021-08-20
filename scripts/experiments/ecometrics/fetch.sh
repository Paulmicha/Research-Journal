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

# Download the environmental footprint data from Boavizta.
# See https://github.com/Boavizta/environmental-footprint-data
if [[ ! -d 'private/footprint-data' ]]; then
	echo "Creating local dir 'private/footprint-data'..."
	mkdir -p 'private/footprint-data'
fi

deviceCsvUrlFr='https://raw.githubusercontent.com/Boavizta/environmental-footprint-data/main/boavizta-data-fr.csv'
deviceCsvUrlUs='https://raw.githubusercontent.com/Boavizta/environmental-footprint-data/main/boavizta-data-us.csv'

csvFileFr="${deviceCsvUrlFr##*/}"
csvFileUs="${deviceCsvUrlUs##*/}"

if [[ ! -f "$PWD/private/footprint-data/$csvFileFr" ]]; then
	echo "Downloading $csvFileFr ..."
	wget "$deviceCsvUrlFr" -P "$PWD/private/footprint-data/"
fi

if [[ ! -f "$PWD/private/footprint-data/$csvFileUs" ]]; then
	echo "Downloading $csvFileUs ..."
	wget "$deviceCsvUrlUs" -P "$PWD/private/footprint-data/"
fi

# Download the CO2 equivalences from datagir.
# See https://github.com/datagir/monconvertisseurco2
if [[ ! -d 'private/co2-eq' ]]; then
	echo "Creating local dir 'private/co2-eq'..."
	mkdir -p 'private/co2-eq'
fi

eqJsonUrl='https://github.com/datagir/monconvertisseurco2/raw/master/public/data/equivalents.json'
eqJsonFile="${eqJsonUrl##*/}"

if [[ ! -f "$PWD/private/co2-eq/$eqJsonFile" ]]; then
	echo "Downloading $eqJsonFile ..."
	wget "$eqJsonUrl" -P "$PWD/private/co2-eq/"
fi

## Transform sources into a single static asset.
node "$PWD/scripts/experiments/ecometrics/extract.js"

echo "Done."
