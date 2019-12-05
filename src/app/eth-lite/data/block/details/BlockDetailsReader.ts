// tslint:disable:no-string-literal
import {IBlockDetails} from "./IBlockDetails";
import {BigNumber} from "app/util/BigNumber";
import {TxDetailsReader} from "app/eth-lite/data/tx/details/TxDetailsReader";
// tslint:disable-next-line: no-var-requires
const RLP = require("rlp");

// tslint:disable: no-console
export class BlockDetailsReader {
    constructor(private txDetailsReader: TxDetailsReader) {
    }

    hexToBytes(hex: any) {
        const bytes = [];
        for (let c = 0; c < hex.length; c += 2) {
            bytes.push(parseInt(hex.substr(c, 2), 16));
        }
        return bytes;
    }

    bytesToHex(bytes: any) {
        const hex = [];
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < bytes.length; i++) {
            // tslint:disable-next-line: no-bitwise
            hex.push((bytes[i] >>> 4).toString(16));
            // tslint:disable-next-line: no-bitwise
            hex.push((bytes[i] & 0xF).toString(16));
        }
        return hex.join("");
    }

    getExtraData(extraData: any) {

        const genesisExtraData = this.hexToBytes(extraData);

        // Remove dressin, 32 bytes pre validators, 65 bytes post validators, and extra byte for 0x
        const extraDataValidators = genesisExtraData.splice(33, genesisExtraData.length - 32 - 65 - 1);

        // Check that the validators length is factor of 20
        console.log(extraDataValidators.length % 20, 0);
        const numValidators = extraDataValidators.length / 20;

        let validators = [];

        // Append each new validator to the array
        for (let i = 0; i < numValidators; ++i) {
            const validator = extraDataValidators.splice(0, 20);
            const v = "0x" + this.bytesToHex(validator);
            if (v.length === 42) {
                console.log("validator", v, v.length);
                validators.push(v);
            }
        }

        let istExtraData = extraData.slice(66);
        let rlpExtraData = RLP.decode("0x" + istExtraData);

        // Get the fullnode list
        let fullnodes = rlpExtraData[0];
        const fullnodesList = [];
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < fullnodes.length; i++) {
            const c = fullnodes[i];
            const str = c.toString("hex");
            fullnodesList.push(str);
        }

        let seal = "0x" + rlpExtraData[1].toString("hex");

        // Get the committed seals
        let committedSeals = rlpExtraData[2];
        const commitedSealsList = [];
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < committedSeals.length; i++) {
            const c = committedSeals[i];
            const str = c.toString("hex");
            commitedSealsList.push(str);
        }

        const ret = {
            fullnodes: fullnodesList,
            seal,
            committedSeals: commitedSealsList
        };
        return ret;
    }

    read(data: any) {
        let blockNumber = Number(data["number"]);

        const extraData = this.getExtraData(data["extraData"]);

        let block: IBlockDetails = {
            id: blockNumber,
            creationTime: Number(data["timestamp"]),
            hash: data["hash"],
            parentHash: data["parentHash"],
            parentId: blockNumber - 1,
            nonce: data["nonce"],
            byteSize: Number(data["size"]),
            sha3uncles: data["sha3Uncles"],
            beneficiaryAddress: data["miner"],
            gasLimit: new BigNumber(data["gasLimit"]),
            gasUsed: new BigNumber(data["gasUsed"]),
            difficulty: new BigNumber(data["difficulty"]),
            extraData,
            logsBloom: data["logsBloom"].replace("0x", ""),
            mixHash: data["mixHash"],
            uncles: data["uncles"] || [],
            transactionCount: Number(data["transactions"].length),
            transactions: ((data["transactions"] || []) as any[]).map(txData => {
                return this.txDetailsReader.read(txData);
            })
        };

        return block;
    }
}
