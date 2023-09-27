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
exports.getTransactionsForBinance = exports.getTransactionsFromTatum = exports.getChain = exports.setProvider = exports.AllChainId = exports.chainHexObj = exports.transferBTC = void 0;
// import * as ecc from 'tiny-secp256k1';
const ecpair_1 = __importDefault(require("ecpair"));
const bitcoin = __importStar(require("bitcoinjs-lib"));
const axios_1 = __importDefault(require("axios"));
const ethers_1 = require("ethers");
const moralis_1 = __importDefault(require("moralis"));
// TinySecp256k1Interface
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
const transferBTC = (privateKey, value, receiver, env, address, ecc) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const createTxResponse = yield createBTCTx(receiver, value, env, address);
        // console.log(createTxResponse, "createTxResponsecreateTxResponse");
        if ((createTxResponse === null || createTxResponse === void 0 ? void 0 : createTxResponse.code) != 1)
            return createTxResponse;
        const tx = createTxResponse.result.tx;
        const toSign = createTxResponse.result.tosign;
        // console.log(tx, toSign);
        const generateSignaturesResponse = generateSignatures(privateKey, env, toSign, ecc);
        if ((generateSignaturesResponse === null || generateSignaturesResponse === void 0 ? void 0 : generateSignaturesResponse.code) != 1)
            return generateSignaturesResponse;
        const signatures = generateSignaturesResponse.signatures;
        const pubkeys = generateSignaturesResponse.pubkeys;
        // console.log(signatures);
        // console.log(pubkeys);
        if (!signatures || !pubkeys) {
            return {
                code: 0,
                error: "ERROR_BTC_SIGNATURES",
            };
        }
        const sendBTCTxResponse = yield sendBTCTx(tx, toSign, signatures, pubkeys, env);
        if ((sendBTCTxResponse === null || sendBTCTxResponse === void 0 ? void 0 : sendBTCTxResponse.code) != 1)
            return sendBTCTxResponse;
        // console.log("Message", tx,
        //     toSign,
        //     signatures,
        //     pubkeys,);
        console.log(sendBTCTxResponse.result);
        const returnValue = sendBTCTxResponse.result;
        return {
            returnValue,
        };
    }
    catch (error) {
        return {
            code: 0,
            error,
        };
    }
});
exports.transferBTC = transferBTC;
const getWorkingUrl = (chainId) => __awaiter(void 0, void 0, void 0, function* () {
    const workingURL = {
        totatURLs: 0,
        urls: [],
    };
    const urls = yield getRPCFromMoralis(chainId);
    const substringToRemove = "${INFURA_API_KEY}";
    const working = yield Promise.all(urls.map((i) => __awaiter(void 0, void 0, void 0, function* () {
        const newString = i.replace(substringToRemove, "");
        try {
            const response = yield axios_1.default.get(newString);
            if (response.status === 200) {
                if (newString !== "" && newString !== undefined) {
                    // console.log("Working", newString);
                    return newString;
                }
            }
            else {
                return "";
            }
        }
        catch (_a) {
            return "";
        }
    })));
    yield working.map((i) => {
        if (i !== "") {
            workingURL.totatURLs += 1;
            workingURL.urls.push(i);
        }
    });
    return workingURL;
});
const getRPCFromMoralis = (chainId) => __awaiter(void 0, void 0, void 0, function* () {
    let rpcURL = [];
    if (chainId === 1) {
        const ethereumNet = moralis_1.default.EvmUtils.EvmChain.ETHEREUM.rpcUrls;
        // console.log(ethereumNet, "ETHEREUM urls");
        rpcURL = ethereumNet;
    }
    else if (chainId === 2) {
        const bscMainNet = moralis_1.default.EvmUtils.EvmChain.BSC.rpcUrls;
        // console.log(bscMainNet, "BSC-MAIN urls");
        rpcURL = bscMainNet;
    }
    else if (chainId === 3) {
        const polygonNet = moralis_1.default.EvmUtils.EvmChain.POLYGON.rpcUrls;
        // console.log(polygonNet, "POLYGON urls");
        rpcURL = polygonNet;
    }
    else if (chainId === 6) {
        const goerliNet = moralis_1.default.EvmUtils.EvmChain.SEPOLIA.rpcUrls;
        // console.log(goerliNet, "SEPOLIA urls");
        rpcURL = goerliNet;
    }
    else if (chainId === 7) {
        const sepoliaNet = moralis_1.default.EvmUtils.EvmChain.BSC_TESTNET.rpcUrls;
        // console.log(sepoliaNet, "BSC_TESTNET urls");
        rpcURL = sepoliaNet;
    }
    else if (chainId === 8) {
        const bscTestNet = moralis_1.default.EvmUtils.EvmChain.MUMBAI.rpcUrls;
        // console.log(bscTestNet, "MUMBAI urls");
        rpcURL = bscTestNet;
    }
    else {
        rpcURL = [];
    }
    return rpcURL;
});
const chainList = [
    { name: "goerli", hex: "0x5" },
    { name: "eth", hex: "0x1" },
    { name: "bsc", hex: "0x38" },
    { name: "polygon", hex: "0x89" },
    { name: "sepolia", hex: "0xaa36a7" },
    { name: "bsc testnet", hex: "0x61" },
    { name: "mumbai", hex: "0x13881" },
    { name: "avalanche", hex: "0xa86a" },
    { name: "avalanche testnet", hex: "0xa869" },
    { name: "fantom", hex: "0xfa" },
    { name: "palm", hex: "0x2a15c308d" },
    { name: "cronos", hex: "0x19" },
    { name: "cronos testnet", hex: "0x152" },
    { name: "arbitrum", hex: "0xa4b1" },
];
exports.chainHexObj = {
    eth: "0x1",
    bsc: "0x38",
    polygon: "0x89",
    goerli: "0x5",
    sepolia: "0xaa36a7",
    bsc_testnet: "0x61",
    mumbai: "0x13881",
    avalanche: "0xa86a",
    avalanche_testnet: "0xa869",
    fantom: "0xfa",
    palm: "0x2a15c308d",
    cronos: "0x19",
    cronos_testnet: "0x152",
    arbitrum: "0xa4b1"
};
exports.AllChainId = [
    {
        id: 0,
        name: "Goerli test network",
        chainId: "5",
        currencySymbol: "GoerliETH",
        rpcURL: "https://eth-goerli.g.alchemy.com/v2/veOOFscjUfWy5-F9idsh8ul-UBvIt3lX",
        explorerURL: "https://goerli.etherscan.io",
    },
    {
        id: 1,
        name: "Ethereum Mainnet",
        chainId: "1",
        currencySymbol: "ETH",
        rpcURL: `https://eth-mainnet.g.alchemy.com/v2/wprScRy-nEz4mjnefQbhtjlGKIBHqPBJ`,
        explorerURL: "https://etherscan.io",
    },
    {
        id: 2,
        name: "BNB Smart Chain (previously Binance Smart Chain Mainnet)",
        chainId: "56",
        currencySymbol: "BNB",
        rpcURL: "https://bsc.getblock.io/acfb8004-9fb8-42c5-a5b2-da8000aaecfa/mainnet/",
        explorerURL: "https://bscscan.com/",
    },
    {
        id: 3,
        name: "Polygon Mainnet",
        chainId: "137",
        currencySymbol: "MATIC",
        rpcURL: "https://polygon-mainnet.g.alchemy.com/v2/Ra7cEGxd4SofbeedjRLWOtw-c7_4KkVP",
        explorerURL: "https://polygonscan.com/",
    },
    {
        id: 6,
        name: "Sepolia test network",
        chainId: "11155111",
        currencySymbol: "SepoliaETH",
        rpcURL: "https://eth-sepolia.g.alchemy.com/v2/R6OILRKTXDUEBz3gObRmArSbNIieviHL",
        explorerURL: "https://sepolia.etherscan.io",
    },
    {
        id: 7,
        name: "Smart Chain - Testnet",
        chainId: "97",
        currencySymbol: "BNB",
        rpcURL: "https://bsc.getblock.io/acfb8004-9fb8-42c5-a5b2-da8000aaecfa/testnet/",
        explorerURL: "https://testnet.bscscan.com",
    },
    {
        id: 8,
        name: "Mumbai Testnet",
        chainId: "80001",
        currencySymbol: "MATIC",
        rpcURL: 'https://rpc-mumbai.maticvigil.com',
        // "https://polygon-mumbai.g.alchemy.com/v2/5y_OoMtv4xEChYXvTbqEr2BebPozufTv",
        explorerURL: "https://mumbai.polygonscan.com/",
    },
];
const setProvider = (chainId) => __awaiter(void 0, void 0, void 0, function* () {
    const urlData = yield getWorkingUrl(chainId);
    // console.log("workingRPC", urlData, "workingRPC");
    let provider;
    let blockNumber = 0;
    try {
        if (Number(chainId) == 1) {
            provider = new ethers_1.ethers.providers.JsonRpcProvider(exports.AllChainId[1].rpcURL);
            blockNumber = yield provider.getBlockNumber();
            // console.log("for ETHEREUM MAIN Network");
        }
        else if (Number(chainId) == 2) {
            provider = new ethers_1.ethers.providers.JsonRpcProvider(exports.AllChainId[2].rpcURL);
            blockNumber = yield provider.getBlockNumber();
            // console.log("for BNB MAIN Network");
        }
        else if (Number(chainId) == 3) {
            provider = new ethers_1.ethers.providers.JsonRpcProvider(exports.AllChainId[3].rpcURL);
            blockNumber = yield provider.getBlockNumber();
            // console.log("for POLYGON MAIN Network");
        }
        else if (Number(chainId) == 6) {
            provider = new ethers_1.ethers.providers.JsonRpcProvider(exports.AllChainId[4].rpcURL);
            blockNumber = yield provider.getBlockNumber();
            // console.log("for SEPOLIA Network");
        }
        else if (Number(chainId) == 7) {
            provider = new ethers_1.ethers.providers.JsonRpcProvider(exports.AllChainId[5].rpcURL);
            blockNumber = yield provider.getBlockNumber();
            // console.log("for BNB TEST Network");
        }
        else if (Number(chainId) == 8) {
            provider = new ethers_1.ethers.providers.JsonRpcProvider(exports.AllChainId[6].rpcURL);
            // blockNumber = await provider.getBlockNumber();
            // console.log("for MUMBAI TEST Network");
        }
        else {
            console.log("Sent Wrong Network ID");
            return 0;
        }
        // if (Number(blockNumber) > 0) {
        //     // console.log(
        //     //   "URL from STATIC Source is being used : ",
        //     //   AllChainId[chainId].rpcURL
        //     // );
        // } else if (urlData.totatURLs > 0) {
        //     provider = new ethers.providers.JsonRpcProvider(urlData.urls[0]);
        //     // console.log("URL from Moralis  is being used : ", urlData.urls[0]);
        // } else {
        //     console.log("None of the URLs worked....!");
        // }
    }
    catch (e) {
        console.log(e, "Error while setting the Provider");
        return 0;
    }
    return provider;
});
exports.setProvider = setProvider;
const getChain = (chainId) => __awaiter(void 0, void 0, void 0, function* () {
    let chain;
    try {
        if (Number(chainId) == 0) {
            chain = chainList[0];
            console.log(chain, "for ETH Network");
        }
        else if (Number(chainId) == 1) {
            chain = chainList[1];
            console.log(chain, "for BNB MAIN Network");
        }
        else if (Number(chainId) == 2) {
            chain = chainList[2];
            console.log(chain, "for GOERLI Network");
        }
        else if (Number(chainId) == 3) {
            chain = chainList[3];
            console.log(chain, "for SEPOLIA Network");
        }
        else if (Number(chainId) == 4) {
            chain = chainList[4];
            console.log(chain, "for BNB TEST Network");
        }
        else if (Number(chainId) == 5) {
            chain = chainList[5];
            console.log(chain, "for POLYGON MAIN Network");
        }
        else if (Number(chainId) == 6) {
            chain = chainList[6];
            console.log(chain, "for MUMBAI TEST Network");
        }
        else {
            console.log("Sent Wrong Network ID");
            return 0;
        }
    }
    catch (e) {
        console.log(e, "Error while getting the chain");
        return 0;
    }
    return chain;
});
exports.getChain = getChain;
// _chain should be from => ethereum ,tron, polygon, bitcoin
const getTransactionsFromTatum = (_chain, _address) => __awaiter(void 0, void 0, void 0, function* () {
    let url = "";
    if (_chain === "ethereum" || _chain === "polygon") {
        url = `https://api.tatum.io/v3/${_chain}/account/transaction/${_address}?pageSize=10`;
    }
    else if (_chain === "tron") {
        url = `https://api.tatum.io/v3/${_chain}/transaction/account/${_address}`;
    }
    else if (_chain === "bitcoin") {
        url = `https://api.tatum.io/v3/${_chain}/transaction/address/${_address}?pageSize=10`;
    }
    else {
        return "Wrong Network Selected";
    }
    let response = "";
    try {
        let config = {
            method: "get",
            maxBodyLength: Infinity,
            url: url,
            headers: {
                "x-api-key": process.env.TRON_MAINNET_API,
            },
        };
        axios_1.default
            .request(config)
            .then((axiosResponse) => {
            console.log(JSON.stringify(axiosResponse.data), "data");
            response = JSON.stringify(axiosResponse.data);
        })
            .catch((error) => {
            console.log(error);
            response = error;
        });
        return response;
    }
    catch (e) {
        console.log("Error while fetching Transactions from TATUM", e);
        response = e;
        return response;
    }
});
exports.getTransactionsFromTatum = getTransactionsFromTatum;
// fetch Transactions for Binance chain(Tesnet-Mainnet) (_isTestNet = true for testnet )
const getTransactionsForBinance = (_isTestNet, _account) => __awaiter(void 0, void 0, void 0, function* () {
    let response = "";
    let hex = "0x38";
    try {
        if (_isTestNet) {
            hex = "0x61";
        }
        response = yield moralis_1.default.EvmApi.transaction.getWalletTransactions({
            chain: hex.toString(),
            address: _account.toString(),
        });
        return response;
    }
    catch (e) {
        console.log("Error while Fetching bitcoin Transactions");
        return e;
    }
});
exports.getTransactionsForBinance = getTransactionsForBinance;
