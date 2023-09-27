"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferBTC = void 0;
const axios_1 = __importDefault(require("axios"));
const bitcoin = __importStar(require("bitcoinjs-lib"));
const ecpair_1 = __importDefault(require("ecpair"));
const sendBTCTx = (tx, toSign, signatures, pubkeys, env) => __awaiter(void 0, void 0, void 0, function* () {
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
        }
        else if (env == "mainnet") {
            url = "https://api.blockcypher.com/v1/btc/main/txs/send";
        }
        else {
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
        const response = yield (0, axios_1.default)({
            url,
            method: "post",
            data: sendTx,
        });
        // console.log(response, "Response...");
        if (response.status != 201) {
            return {
                code: 0,
                message: response === null || response === void 0 ? void 0 : response.data,
            };
        }
        // console.log(response.data);
        return {
            code: 1,
            result: response.data,
        };
    }
    catch (error) {
        console.log("error sending btc txs", error);
        return {
            code: 0,
            error,
        };
    }
});
const createBTCTx = (toAddress, value, env, fromAddress) => __awaiter(void 0, void 0, void 0, function* () {
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
        }
        else if (env == "mainnet") {
            url = "https://api.blockcypher.com/v1/btc/main/txs/new";
        }
        else {
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
        const response = yield (0, axios_1.default)({
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
    }
    catch (error) {
        console.log("error generating btc tx", error);
        return {
            code: 0,
            message: error,
        };
    }
});
const generateSignatures = (privateKey, env, toSign, ecc) => {
    try {
        const ECPair = (0, ecpair_1.default)(ecc);
        // console.log(ECPair);
        let keys;
        if (env == "testnet") {
            keys = ECPair.fromWIF(privateKey, bitcoin.networks.testnet);
            //   console.log(keys);
        }
        else if (env == "mainnet") {
            keys = ECPair.fromWIF(privateKey, bitcoin.networks.bitcoin);
            //   console.log(keys);
        }
        else {
            return {
                code: 0,
                error: "Invalid ENV",
            };
        }
        const signatures = [];
        const pubkeys = [];
        for (let i = 0; i < toSign.length; i++) {
            // console.log(i,"Data");
            signatures.push(bitcoin.script.signature
                .encode(keys.sign(Buffer.from(toSign[i], "hex")), 0x01)
                .toString("hex")
                .slice(0, -2));
            pubkeys.push(keys.publicKey.toString("hex"));
        }
        // console.log("Signature", signatures, "Pubkeys", pubkeys);
        return {
            code: 1,
            signatures,
            pubkeys,
        };
    }
    catch (error /* : any */) {
        return {
            code: 0,
            error,
        };
    }
};
const transferBTC = (privateKey, value, receiver, env, address, ecc) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const createTxResponse = yield createBTCTx(receiver, value, env, address);
        // console.log(createTxResponse, "createTxResponsecreateTxResponse");
        if ((createTxResponse === null || createTxResponse === void 0 ? void 0 : createTxResponse.code) != 1)
            return { data: createTxResponse, message: "", status: false };
        const tx = createTxResponse.result.tx;
        const toSign = createTxResponse.result.tosign;
        // console.log(tx, toSign);
        const generateSignaturesResponse = generateSignatures(privateKey, env, toSign, ecc);
        if ((generateSignaturesResponse === null || generateSignaturesResponse === void 0 ? void 0 : generateSignaturesResponse.code) != 1)
            return { data: generateSignaturesResponse, message: "", status: false };
        const signatures = generateSignaturesResponse.signatures;
        const pubkeys = generateSignaturesResponse.pubkeys;
        // console.log(signatures);
        // console.log(pubkeys);
        if (!signatures || !pubkeys) {
            return {
                data: 0,
                message: "ERROR_BTC_SIGNATURES",
                status: false
            };
        }
        const sendBTCTxResponse = yield sendBTCTx(tx, toSign, signatures, pubkeys, env);
        if ((sendBTCTxResponse === null || sendBTCTxResponse === void 0 ? void 0 : sendBTCTxResponse.code) != 1)
            return { data: sendBTCTxResponse, message: "Test BTC Sent!", status: false };
        // console.log("Message", tx,
        //     toSign,
        //     signatures,
        //     pubkeys,);
        console.log(sendBTCTxResponse.result);
        const returnValue = sendBTCTxResponse.result;
        return {
            data: returnValue, message: "", status: true,
        };
    }
    catch (error) {
        return {
            data: 0,
            message: error,
            status: false
        };
    }
});
exports.transferBTC = transferBTC;
