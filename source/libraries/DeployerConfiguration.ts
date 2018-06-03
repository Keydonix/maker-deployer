import * as path from 'path';

const ARTIFACT_OUTPUT_ROOT  = (typeof process.env.ARTIFACT_OUTPUT_ROOT === 'undefined') ? path.join(__dirname, '../../output/contracts') : path.normalize(<string> process.env.ARTIFACT_OUTPUT_ROOT);

export class DeployerConfiguration {
    public readonly contractInputPath: string;
    public readonly contractAddressesOutputPathJson: string;
    public readonly contractAddressesOutputPathEnvFile: string;
    public readonly uploadBlockNumbersOutputPath: string;
    public readonly isProduction: boolean;

    public constructor(contractInputRoot: string, artifactOutputRoot: string, isProduction: boolean=false) {
        this.isProduction = isProduction;

        this.contractAddressesOutputPathJson = path.join(artifactOutputRoot, 'addresses.json');
        this.contractAddressesOutputPathEnvFile = path.join(artifactOutputRoot, 'addresses.env');
        this.uploadBlockNumbersOutputPath = path.join(artifactOutputRoot, 'upload-block-numbers.json');
        this.contractInputPath = path.join(contractInputRoot, 'contracts.json');
    }

    public static create(artifactOutputRoot: string=ARTIFACT_OUTPUT_ROOT, isProduction: boolean=false): DeployerConfiguration {
        const contractInputRoot = (typeof process.env.CONTRACT_INPUT_ROOT === 'undefined') ? path.join(__dirname, '../../output/contracts') : path.normalize(<string> process.env.CONTRACT_INPUT_ROOT);
        isProduction = (typeof process.env.IS_PRODUCTION === 'string') ? process.env.IS_PRODUCTION === 'true' : isProduction;

        return new DeployerConfiguration(contractInputRoot, artifactOutputRoot, isProduction);
    }

}
