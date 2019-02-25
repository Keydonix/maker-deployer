#!/bin/bash

set -e

cd /
/bin/parity --config /home/parity/config.toml &

cd /maker-deployer

npm install
npx tsc
./fetch-contracts.sh
node output/deployment/compileContracts.js
node output/tools/generateContractInterfaces.js

node output/deployment/deployContracts.js

kill -TERM $(pidof parity)
