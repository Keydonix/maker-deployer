#!/usr/bin/env node

import { ContractDeployer } from "../libraries/ContractDeployer";
import { DeployerConfiguration } from '../libraries/DeployerConfiguration';
import { NetworkConfiguration } from '../libraries/NetworkConfiguration';
import { sleep } from "../libraries/HelperFunctions";
import { Connector } from "../libraries/Connector";

async function spinUntilConnected(networkConfiguration: NetworkConfiguration) {
    const connector = new Connector(networkConfiguration);
    while (true) {
        try {
            console.log(`attempting to connect to Ethereum node at ${networkConfiguration.http}...`)
            await connector.ethjsQuery.getBlockByNumber('latest', false)
            break
        } catch (error) {
            await sleep(1000)
            continue
        }
    }
}

// the rest of the code in this file is for running this as a standalone script, rather than as a library
export async function deployContracts() {
    require('source-map-support').install();

    const networkConfiguration = NetworkConfiguration.create();
    await spinUntilConnected(networkConfiguration);
    await ContractDeployer.deployToNetwork(networkConfiguration, DeployerConfiguration.create());
}

deployContracts().then(() => {
    process.exitCode = 0;
}).catch(error => {
    console.log(error);
    process.exitCode = 1;
});
