#!/bin/bash

cd /
./start.sh &

cd /maker-docker-poa

npm install
npx tsc
./fetch-sai-contracts.sh
node output/deployment/compileContracts.js
node output/tools/generateContractInterfaces.js

node output/deployment/deployContracts.js

kill -TERM $(pidof parity)
