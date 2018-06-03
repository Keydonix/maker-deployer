#!/bin/bash

cd /
./start.sh &

cd /maker-docker-poa

sleep 10 &

npm install
npx tsc
./fetch-sai-contracts.sh
node output/deployment/compileContracts.js
node output/tools/generateContractInterfaces.js

# We need to give parity some time to come up. The above commands usually take plenty of time, but this waits on a
# Backgrounded sleep that was kicked off earlier, just in case the above steps finish too quickly
wait %2

node output/deployment/deployContracts.js

kill -TERM $(pidof parity)
