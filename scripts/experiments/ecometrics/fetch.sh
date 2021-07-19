#!/usr/bin/env bash

##
# Fetches and prepares data sources for the "Ecometrics" experiment.
#
# @example
#		# From project docroot :
#		scripts/experiments/ecometrics/fetch.sh
#   # -> Results : see static/data/entities/experiment/search_index.json
#

# Download the environmental footprint data from Boavizta.
# See https://github.com/Boavizta/environmental-footprint-data
if [[ ! -d 'private/footprint-data' ]]; then
	echo "Creating local dir 'private/footprint-data'..."
	mkdir -p 'private/footprint-data'
fi

csvUrlFr='https://raw.githubusercontent.com/Boavizta/environmental-footprint-data/main/boavizta-data-fr.csv'
csvUrlUs='https://raw.githubusercontent.com/Boavizta/environmental-footprint-data/main/boavizta-data-us.csv'

csvFileFr="${csvUrlFr##*/}"
csvFileUs="${csvUrlUs##*/}"

if [[ ! -f "$PWD/private/footprint-data/$csvFileFr" ]]; then
	echo "Downloading $csvFileFr ..."
	wget "$csvUrlFr" -P "$PWD/private/footprint-data/"
fi

if [[ ! -f "$PWD/private/footprint-data/$csvFileUs" ]]; then
	echo "Downloading $csvFileUs ..."
	wget "$csvUrlUs" -P "$PWD/private/footprint-data/"
fi

if [[ -f 'static/data/ecometrics.sqlite' ]]; then
	echo "Updating 'static/data/ecometrics.sqlite'..."
else
	echo "Generating 'static/data/ecometrics.sqlite'..."
fi

node "$PWD/scripts/experiments/ecometrics/extract.js"

echo "Done."
