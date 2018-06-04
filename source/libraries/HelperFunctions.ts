import BN = require("bn.js");

export function stringTo32ByteHex(stringToEncode: string): string {
    return `0x${Buffer.from(stringToEncode, 'utf8').toString('hex').padEnd(64, '0')}`;
}

export function bnTo32ByteHex(value: BN) {
    return "0x" + value.toString(16).padStart(64, '0');
}

export async function sleep(milliseconds: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(resolve, milliseconds));
}
