#!/bin/bash

set -e

cd /
/parity/parity --config /parity/config.toml &

cd /maker-deployer

npm install
npx tsc
./fetch-sai-contracts.sh
node output/deployment/compileContracts.js
node output/tools/generateContractInterfaces.js

node output/deployment/deployContracts.js

kill -TERM $(pidof parity)
