import { exists, readFile, writeFile } from "async-file";
import { encodeParams } from 'ethjs-abi';
import { stringTo32ByteHex, resolveAll } from "./HelperFunctions";
import { CompilerOutput } from "solc";
import { Abi, AbiFunction } from 'ethereum';
import { DeployerConfiguration } from './DeployerConfiguration';
import { Connector } from './Connector';
import { NetworkConfiguration } from './NetworkConfiguration';
import { AccountManager } from './AccountManager';
import { Contracts, Contract } from './Contracts';
import {
    GemFab,
    TubFab,
    VoxFab,
    DaiFab,
    DadFab,
    MomFab,
    TopFab,
    TapFab,
    WETH9,
    DSToken,
    DSRoles,
    DSValue
} from "./ContractInterfaces";

type ContractAddressMapping = { [name: string]: string };
type NetworkAddressMapping = { [networkId: string]: ContractAddressMapping };

export class ContractDeployer {
    private readonly accountManager: AccountManager;
    private readonly configuration: DeployerConfiguration;
    private readonly connector: Connector;
    private readonly contracts: Contracts;

    public static deployToNetwork = async (networkConfiguration: NetworkConfiguration, deployerConfiguration: DeployerConfiguration) => {
        const connector = new Connector(networkConfiguration);
        const accountManager = new AccountManager(connector, networkConfiguration.privateKey);

        const compilerOutput = JSON.parse(await readFile(deployerConfiguration.contractInputPath, "utf8"));
        const contractDeployer = new ContractDeployer(deployerConfiguration, connector, accountManager, compilerOutput);

        console.log(`\n\n-----------------
Deploying to: ${networkConfiguration.networkName}
    compiled contracts: ${deployerConfiguration.contractInputPath}
    contract address: ${deployerConfiguration.contractAddressesOutputPath}
    upload blocks #s: ${deployerConfiguration.uploadBlockNumbersOutputPath}
`);
        await contractDeployer.deploy();
    };

    public constructor(configuration: DeployerConfiguration, connector: Connector, accountManager: AccountManager, compilerOutput: CompilerOutput) {
        this.configuration = configuration;
        this.connector = connector;
        this.accountManager = accountManager;
        this.contracts = new Contracts(compilerOutput);
    }

    public async deploy(): Promise<void> {
        const gemFabContract = new GemFab(this.connector, this.accountManager, await this.simpleDeploy("GemFab"), this.connector.gasPrice);
        const voxFabContract = new VoxFab(this.connector, this.accountManager, await this.simpleDeploy("VoxFab"), this.connector.gasPrice);
        const tubFabContract = new TubFab(this.connector, this.accountManager, await this.simpleDeploy("TubFab"), this.connector.gasPrice);
        const tapFabContract = new TapFab(this.connector, this.accountManager, await this.simpleDeploy("TapFab"), this.connector.gasPrice);
        const topFabContract = new TopFab(this.connector, this.accountManager, await this.simpleDeploy("TopFab"), this.connector.gasPrice);
        const momFabContract = new MomFab(this.connector, this.accountManager, await this.simpleDeploy("MomFab"), this.connector.gasPrice);
        const dadFabContract = new DadFab(this.connector, this.accountManager, await this.simpleDeploy("DadFab"), this.connector.gasPrice);

        // test -z $SAI_GEM && GEMtx=$(dapp create DSToken $(seth --to-bytes32 $(seth --from-ascii 'ETH')))
        const saiGemContract = new WETH9(this.connector, this.accountManager, await this.simpleDeploy("WETH9"), this.connector.gasPrice );
        // await wethContract.deposit({attachedEth: new BN(1000)})

        // test -z $SAI_GOV && GOVtx=$(dapp create DSToken $(seth --to-bytes32 $(seth --from-ascii 'GOV')))
        const saiGovContract = new DSToken(this.connector, this.accountManager, await this.simpleDeploy("DSToken", [stringTo32ByteHex("GOV")]), this.connector.gasPrice)

        // test -z $SAI_PIP && PIPtx=$(dapp create DSValue)
        const saiPipContract = new DSValue(this.connector, this.accountManager, await this.simpleDeploy("DSValue"), this.connector.gasPrice)

        // test -z $SAI_PEP && PEPtx=$(dapp create DSValue)
        const saiPepContract = new DSValue(this.connector, this.accountManager, await this.simpleDeploy("DSValue"), this.connector.gasPrice)

        // test -z $SAI_PIT && SAI_PIT="0x0000000000000000000000000000000000000123"
        // I suppose burner is optional? Consider adding later
        const saiPitAddress = "0x0000000000000000000000000000000000000123";

        // DAI_FAB=$(dapp create DaiFab $GEM_FAB $VOX_FAB $TUB_FAB $TAP_FAB $TOP_FAB $MOM_FAB $DAD_FAB)
        const daiFabAddress = await this.simpleDeploy("DaiFab", [
            gemFabContract.address,
            voxFabContract.address,
            tubFabContract.address,
            tapFabContract.address,
            topFabContract.address,
            momFabContract.address,
            dadFabContract.address,
        ]);
        const daiFabContract = new DaiFab(this.connector, this.accountManager, daiFabAddress, this.connector.gasPrice);

        //
        // if [ -z $SAI_ADM ]
        // then
        //     SAI_ADM=$(dapp create DSRoles)
        //     seth send $SAI_ADM 'setRootUser(address,bool)' $ETH_FROM true
        // fi
        const saiAdmContract = new DSRoles(this.connector, this.accountManager, await this.simpleDeploy("DSRoles"), this.connector.gasPrice)

        // seth send $DAI_FAB 'makeTokens()
        console.log("DaiFab.makeTokens()");
        await daiFabContract.makeTokens();

        // seth send $DAI_FAB 'makeVoxTub(address,address,address,address,address)' $SAI_GEM $SAI_GOV $SAI_PIP $SAI_PEP $SAI_PIT
        console.log("DaiFab.makeVoxTub()");
        await daiFabContract.makeVoxTub(
            saiGemContract.address,
            saiGovContract.address,
            saiPipContract.address,
            saiPepContract.address,
            saiPitAddress,
        );

        // seth send $DAI_FAB 'makeTapTop()'
        console.log("DaiFab.makeTapTop()");
        await daiFabContract.makeTapTop();

        // seth send $DAI_FAB 'configParams()'
        console.log("DaiFab.configParams()");
        await daiFabContract.configParams();

        console.log("DaiFab.verifyParams()");
        // seth send $DAI_FAB 'verifyParams()'
        await daiFabContract.verifyParams();

        // seth send $DAI_FAB 'configAuth(address)' $SAI_ADM
        console.log("DaiFab.configAuth()");
        await daiFabContract.configAuth(saiAdmContract.address);

        const deployedContractAddresses = {
            gem: saiGemContract.address,
            gov: saiGovContract.address,
            pip: saiPipContract.address,
            pep: saiPepContract.address,
            pit: saiPitAddress,
            adm: saiGemContract.address,

            sai: await daiFabContract.sai_(),
            sin: await daiFabContract.sin_(),
            skr: await daiFabContract.skr_(),
            dad: await daiFabContract.dad_(),
            mom: await daiFabContract.mom_(),
            vox: await daiFabContract.vox_(),
            tub: await daiFabContract.tub_(),
            tap: await daiFabContract.tap_(),
            top: await daiFabContract.top_(),
        };
        await this.generateAddressMappingFile(deployedContractAddresses);
    }

    private async simpleDeploy(contractName: string, constructorArgs?: Array<any>): Promise<string> {
        return await this.construct(this.contracts.get(contractName), constructorArgs || [], `Uploading ${contractName}`);
    }

    private static getEncodedConstructData(abi: Abi, bytecode: Buffer, constructorArgs: Array<string>): Buffer {
        if (constructorArgs.length === 0) {
            return bytecode;
        }
        // TODO: submit a TypeScript bug that it can't deduce the type is AbiFunction|undefined here
        const constructorSignature = <AbiFunction | undefined>abi.find(signature => signature.type === 'constructor');
        if (typeof constructorSignature === 'undefined') throw new Error(`ABI did not contain a constructor.`);
        const constructorInputTypes = constructorSignature.inputs.map(x => x.type);
        const encodedConstructorParameters = Buffer.from(encodeParams(constructorInputTypes, constructorArgs).substring(2), 'hex');
        return Buffer.concat([bytecode, encodedConstructorParameters]);
    }

    private async construct(contract: Contract, constructorArgs: Array<string>, failureDetails: string): Promise<string> {
        const data = `0x${ContractDeployer.getEncodedConstructData(contract.abi, contract.bytecode, constructorArgs).toString('hex')}`;
        const gasEstimate = await this.connector.ethjsQuery.estimateGas({
            from: this.accountManager.defaultAddress,
            data: data
        });
        const nonce = await this.accountManager.nonces.get(this.accountManager.defaultAddress);
        const signedTransaction = await this.accountManager.signTransaction({
            gas: gasEstimate,
            gasPrice: this.connector.gasPrice,
            data: data
        });
        console.log(`Upload contract: ${contract.contractName} nonce: ${nonce}, gas: ${gasEstimate}, gasPrice: ${this.connector.gasPrice}`);
        const transactionHash = await this.connector.ethjsQuery.sendRawTransaction(signedTransaction);
        const receipt = await this.connector.waitForTransactionReceipt(transactionHash, failureDetails);
        console.log(`Uploaded contract: ${contract.contractName}: \"${receipt.contractAddress}\"`);
        return receipt.contractAddress;
    }

    private async generateAddressMapping(contractAddressMapping: ContractAddressMapping): Promise<string> {
        const networkId = await this.connector.ethjsQuery.net_version();
        let addressMapping: NetworkAddressMapping = {};
        if (await exists(this.configuration.contractAddressesOutputPath)) {
            let existingAddressFileData: string = await readFile(this.configuration.contractAddressesOutputPath, 'utf8');
            addressMapping = JSON.parse(existingAddressFileData);
        }
        addressMapping[networkId] = contractAddressMapping;
        return JSON.stringify(addressMapping, null, ' ');
    }

    private async generateAddressMappingFile(contractAddressMapping: ContractAddressMapping): Promise<void> {
        const addressMappingJson = await this.generateAddressMapping(contractAddressMapping);
        await writeFile(this.configuration.contractAddressesOutputPath, addressMappingJson, 'utf8')
    }
}
