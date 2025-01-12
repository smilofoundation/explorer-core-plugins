import { BigNumber } from "app/util/BigNumber";
import { ITxDetails } from "app/eth-lite/data/tx/details/ITxDetails";
import { IBlockCommonDetails } from "app/shared/data/block/IBlockCommonDetails";

export interface IBlockDetails extends IBlockCommonDetails {
    /** Block number */
    id: number;
    /** Unix timestamp */
    creationTime: number;
    hash: string;
    parentHash: string;
    /** Parent block number (always id - 1) */
    parentId: number;
    nonce?: string;
    byteSize: number;
    sha3uncles: string;
    beneficiaryAddress: string;
    gasUsed: BigNumber;
    gasLimit: BigNumber;
    difficulty: BigNumber;
    extraData: any;
    logsBloom: string;
    mixHash?: string;
    /** Hashes of uncles */
    uncles: string[];

    transactionCount: number;
    transactions: ITxDetails[];
}
