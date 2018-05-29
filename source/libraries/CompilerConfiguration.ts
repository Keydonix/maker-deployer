import * as path from 'path';

export class CompilerConfiguration {
    public readonly contractSourceRoot: string;
    public readonly outputRoot: string;
    public readonly contractInterfacesOutputPath: string;
    public readonly abiOutputPath: string
    public readonly contractOutputPath: string
    public readonly activeContracts: Array<string>

    public constructor(contractSourceRoot: string, outputRoot: string, activeContracts: Array<string>) {
        this.contractSourceRoot = contractSourceRoot;
        this.outputRoot = outputRoot;
        this.activeContracts = activeContracts;
        this.contractInterfacesOutputPath = path.join(contractSourceRoot, '../libraries', 'ContractInterfaces.ts');
        this.abiOutputPath = path.join(outputRoot, 'abi.json');
        this.contractOutputPath = path.join(outputRoot, 'contracts.json');
    }

    public static create(): CompilerConfiguration {
        const contractSourceRoot = path.join(__dirname, "../../source/contracts/");
        const outputRoot = (typeof process.env.OUTPUT_PATH === "undefined") ? path.join(__dirname, "../../output/contracts/") : path.normalize(<string> process.env.OUTPUT_ROOT);
        // TODO: Feels overly specific to put it here, put it one level up
        const activeContracts = [ "sai/fab.sol", "sai/mom.sol", "sai/pit.sol", "sai/tap.sol", "sai/top.sol", "sai/tub.sol", "sai/vox.sol", "sai/weth9.sol" ];
        return new CompilerConfiguration(contractSourceRoot, outputRoot, activeContracts);
    }
}
