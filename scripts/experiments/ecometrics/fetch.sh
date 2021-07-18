#!/usr/bin/env bash

##
# Fetches data sources for the Ecometrics experiment.
#
# @example
#		# From project docroot :
#		scripts/experiments/ecometrics/fetch.sh
#   # -> Results : see static/data/entities/experiment/search_index.json
#


echo "Extract results ..."
node $PWD/scripts/experiments/ecometrics/extract.js
echo "Done."
