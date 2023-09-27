import axios from "axios";
import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory from "ecpair";
import { sendNativeType } from "./types";

const sendBTCTx = async (
    tx: any,
    toSign: any,
    signatures: any,
    pubkeys: any,
    env: string
) => {
    try {
        // const { tx, toSign, signatures, pubkeys, env } = data;
        if (!tx || !toSign || !signatures || !pubkeys || !env) {
            return {
                code: 0,
                message: "invalid/insufficient parameters",
            };
        }
        let url;
        if (env == "testnet") {
            url = "https://api.blockcypher.com/v1/btc/test3/txs/send";
        } else if (env == "mainnet") {
            url = "https://api.blockcypher.com/v1/btc/main/txs/send";
        } else {
            return {
                code: 0,
                message: "Invalid env",
            };
        }
        const sendTx = {
            tx,
            signatures,
            pubkeys,
            tosign: toSign,
        };
        const response = await axios({
            url,
            method: "post",
            data: sendTx,
        });
        // console.log(response, "Response...");
        if (response.status != 201) {
            return {
                code: 0,
                message: response?.data,
            };
        }
        // console.log(response.data);
        return {
            code: 1,
            result: response.data,
        };
    } catch (error) {
        console.log("error sending btc txs", error);
        return {
            code: 0,
            error,
        };
    }
};

const createBTCTx = async (
    toAddress: any,
    value: number,
    env: string,
    fromAddress: any
) => {
    try {
        // const { toAddress, value, env, fromAddress } = data;
        const valueInSatoshi = value * 100000000;
        // console.log("Vivek bhai ",toAddress, value, env, fromAddress);
        if (!fromAddress || !toAddress || !value || !env) {
            return {
                code: 0,
                message: "invalid/insufficient parameters",
            };
        }
        let url;
        if (env == "testnet") {
            url = "https://api.blockcypher.com/v1/btc/test3/txs/new";
        } else if (env == "mainnet") {
            url = "https://api.blockcypher.com/v1/btc/main/txs/new";
        } else {
            return {
                code: 0,
                message: "Invalid env",
            };
        }
        const tx = {
            inputs: [{ addresses: [fromAddress] }],
            outputs: [{ addresses: [toAddress], value: valueInSatoshi }],
        };
        // console.log("hello",tx.inputs[0]);
        const response = await axios({
            url,
            method: "post",
            data: tx,
        });
        if (response.status != 201) {
            return {
                code: 0,
                message: response.data.error,
            };
        }
        return {
            code: 1,
            result: response.data,
        };
    } catch (error) {
        console.log("error generating btc tx", error);
        return {
            code: 0,
            message: error,
        };
    }
};

const generateSignatures = (
    privateKey: any,
    env: string,
    toSign: string | any[],
    ecc: any
) => {
    try {
        const ECPair = ECPairFactory(ecc);
        // console.log(ECPair);
        let keys;
        if (env == "testnet") {
            keys = ECPair.fromWIF(privateKey, bitcoin.networks.testnet);
            //   console.log(keys);
        } else if (env == "mainnet") {
            keys = ECPair.fromWIF(privateKey, bitcoin.networks.bitcoin);
            //   console.log(keys);
        } else {
            return {
                code: 0,
                error: "Invalid ENV",
            };
        }
        const signatures: any = [];
        const pubkeys: any = [];
        for (let i = 0; i < toSign.length; i++) {
            // console.log(i,"Data");
            signatures.push(
                bitcoin.script.signature
                    .encode(keys.sign(Buffer.from(toSign[i], "hex")), 0x01)
                    .toString("hex")
                    .slice(0, -2)
            );
            pubkeys.push(keys.publicKey.toString("hex"));
        }
        // console.log("Signature", signatures, "Pubkeys", pubkeys);
        return {
            code: 1,
            signatures,
            pubkeys,
        };
    } catch (error /* : any */) {
        return {
            code: 0,
            error,
        };
    }
};

export const transferBTC = async (
    privateKey: string,
    value: number,
    receiver: string,
    env: string,
    address: string,
    ecc: any
): Promise<sendNativeType> => {
    try {
        const createTxResponse = await createBTCTx(receiver, value, env, address);
        // console.log(createTxResponse, "createTxResponsecreateTxResponse");
        if (createTxResponse?.code != 1) return { data: createTxResponse, message: "", status: false };
        const tx = createTxResponse.result.tx;
        const toSign = createTxResponse.result.tosign;
        // console.log(tx, toSign);
        const generateSignaturesResponse = generateSignatures(
            privateKey,
            env,
            toSign,
            ecc
        );
        if (generateSignaturesResponse?.code != 1)
            return { data: generateSignaturesResponse, message: "", status: false };
        const signatures = generateSignaturesResponse.signatures;
        const pubkeys = generateSignaturesResponse.pubkeys;
        // console.log(signatures);
        // console.log(pubkeys);
        if (!signatures || !pubkeys) {
            return {
                data: 0,
                message: "ERROR_BTC_SIGNATURES",
                status:false
            };
        }
        const sendBTCTxResponse = await sendBTCTx(
            tx,
            toSign,
            signatures,
            pubkeys,
            env
        );
        if (sendBTCTxResponse?.code != 1) return { data: sendBTCTxResponse, message: "Test BTC Sent!", status: false };
        // console.log("Message", tx,
        //     toSign,
        //     signatures,
        //     pubkeys,);
        console.log(sendBTCTxResponse.result);
        const returnValue = sendBTCTxResponse.result;
        return {
            data: returnValue, message: "", status: true,
        };
    } catch (error:any) {
        return {
            data: 0,
            message: error,
            status: false
        };
    }
};