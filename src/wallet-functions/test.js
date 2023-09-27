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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionsHistory = exports.getGasFees = exports.sendNativeTokens = exports.getBalance = exports.importAccountFromPhraseAndIndex = exports.importAccountFromPhrase = exports.importAnyAccountFromPrivateKey = exports.createWallet = void 0;
const utils_1 = require("./utils");
const ethers_1 = require("ethers");
const { randomBytes } = require("crypto");
const Wallet = require("wallet.ts");
const bip39 = require("@scure/bip39");
const ecc = __importStar(require("tiny-secp256k1"));
// 1 ) Create Wallet Function
const createWallet = (env) => {
    try {
        const mnemonic = Wallet.Mnemonic.generate(randomBytes(16));
        const phrase = mnemonic.phrase;
        const seed = mnemonic.toSeed();
        const data2 = bip39.mnemonicToSeedSync(phrase, "");
        return (0, utils_1._fetchAccountsByIndex)(phrase, 0, env);
    }
    catch (e) {
        return e;
    }
};
exports.createWallet = createWallet;
// Test
// CreateWallet("mainnet");
// 2 ) Import an Account From Private Key
const importAnyAccountFromPrivateKey = (_network, _privateKey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (_network === 1 || _network === 2 || _network === 3 || _network === 6 || _network === 7 || _network === 8) {
            // for Ethereum, Binance and Polygon (Mainnet and Testnet)
            return yield (0, utils_1._importEthereumAccountFromPrivateKey)(_privateKey);
        }
        else if (_network === 4 || _network === 9) {
            // for Tron (Mainnet and Testnet)
            return yield (0, utils_1._importTronAccountFromPrivateKey)(_privateKey);
        }
        else if (_network === 5) {
            // for Bitcoin (Mainnet)
            return yield (0, utils_1._importBitcoinAccountFromPrivateKeyMain)(_privateKey);
        }
        else if (_network === 10) {
            // for Bitcoin (Testnet)
            return yield (0, utils_1._importBitcoinAccountFromPrivateKeyTest)(_privateKey);
        }
        else {
            return "Wrong Network Selected";
        }
    }
    catch (e) {
        return `unknown error: ${e}`;
    }
});
exports.importAnyAccountFromPrivateKey = importAnyAccountFromPrivateKey;
// Test
// importAnyAccountFromPrivateKey(5,"L4oomL38goyFwNMKcd6GcZu9ScW76RSUjQAw1j2Z6T6QUoCaeECE")
// 3 ) Import an Account From Secret Phrase
function importAccountFromPhrase(_phrase, _env) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = ethers_1.utils.isValidMnemonic(_phrase);
        if (!res) {
            return "Invalid Phrase, please check again";
        }
        return (0, utils_1._fetchAccountsByIndex)(_phrase, 0, _env);
    });
}
exports.importAccountFromPhrase = importAccountFromPhrase;
// 4 ) Import an Account From Secret Phrase and Index
const importAccountFromPhraseAndIndex = (_phrase, _index, _env) => __awaiter(void 0, void 0, void 0, function* () {
    const res = ethers_1.utils.isValidMnemonic(_phrase);
    if (!res) {
        return "Invalid Phrase, please check again";
    }
    return (0, utils_1._fetchAccountsByIndex)(_phrase, _index, _env);
});
exports.importAccountFromPhraseAndIndex = importAccountFromPhraseAndIndex;
// 5 ) Get Balance of Native Token ~ Pendng (haved to fix EVM bal by Moralis)
const getBalance = (_address, _network) => __awaiter(void 0, void 0, void 0, function* () {
    const validAddress = yield (0, utils_1.isValidAddress)(_address, _network);
    if (!validAddress) {
        return "Invalid Address";
    }
    if (_network === 1 || _network === 2 || _network === 3 || _network === 6 || _network === 7 || _network === 8) {
        // for Ethereum, Binance and Polygon (Mainnet and Testnet)
        console.log("For EVM");
        return { balance: yield (0, utils_1.getEthereumBalance)(_address, _network) };
    }
    else if (_network === 4 || _network === 9) {
        // for Tron (Mainnet)
        console.log("For TRON MAIN");
        return yield (0, utils_1.getTronBalanceMain)(_address);
    }
    else if (_network === 4 || _network === 9) {
        // for Tron (Testnet)
        console.log("For TRON TEST");
        return yield (0, utils_1.getTronBalanceTest)(_address);
    }
    else if (_network === 5) {
        // for Bitcoin (Mainnet)
        console.log("For BITCOIN MAIN");
        return yield (0, utils_1.getMainnetBitcoinBalance)(_address);
    }
    else if (_network === 10) {
        // for Bitcoin (Testnet)
        console.log("For BITCOIN TEST");
        return yield (0, utils_1.getTestnetBitcoinBalance)(_address);
    }
    else {
        return "Wrong Network Selected";
    }
});
exports.getBalance = getBalance;
// 6 ) send Native Token ~ Pending (Have to fix Sednig EVM token response)
const sendNativeTokens = (_fromAddress, _privateKey, _toAddress, _amount, _network) => __awaiter(void 0, void 0, void 0, function* () {
    if (_network === 1 || _network === 2 || _network === 3 || _network === 6 || _network === 7 || _network === 8) {
        // for Ethereum, Binance and Polygon (Mainnet and Testnet)
        console.log("Sending EVM Tokens, please wait...");
        const _evmRes = yield (0, utils_1.sendEVMNativeTokens)(_fromAddress, _privateKey, _toAddress, _amount.toString(), _network);
        console.log(_evmRes, "_evmRes");
        return _evmRes;
    }
    else if (_network === 4) {
        // for Tron (Mainnet)
        console.log("Sending TRON Main Tokens, please wait...");
        return yield (0, utils_1.sendNativeTronMain)(_privateKey, Number(_amount), _toAddress);
    }
    else if (_network === 9) {
        // for Tron (Testnet)
        console.log("Sending TRON Test Tokens, please wait...");
        return yield (0, utils_1.sendNativeTronTest)(_privateKey, Number(_amount), _toAddress);
    }
    else if (_network === 5) {
        // for Bitcoin (Mainnet)
        console.log("Sending Bitcoin Main Tokens, please wait...");
        return yield (0, utils_1.transferBitcoin)(_privateKey, _amount, _toAddress, "mainnet", _fromAddress, ecc);
    }
    else if (_network === 10) {
        // for Bitcoin (Testnet)
        console.log("Sending Bitcoin Test Tokens, please wait...");
        return yield (0, utils_1.transferBitcoin)(_privateKey, _amount, _toAddress, "testnet", _fromAddress, ecc);
    }
    else {
        return { data: "", message: "Wrong Network Selected", status: false };
    }
});
exports.sendNativeTokens = sendNativeTokens;
// 7 ) Estimate Gas Fees
const getGasFees = (_network, _fromAddress, _privateKey, _toAddress, _amount) => __awaiter(void 0, void 0, void 0, function* () {
    if (_network === 1 || _network === 2 || _network === 3 || _network === 6 || _network === 7 || _network === 8) {
        // for Ethereum, Binance and Polygon (Mainnet and Testnet)
        return (0, utils_1.getEthereumGasPrice)(_network, _privateKey, _toAddress, _amount);
    }
    else if (_network === 4 || _network === 9) {
        // for Tron (Mainnet/Testnet)
        return (0, utils_1.getTronResourceConsumption)(_fromAddress, _toAddress, _amount);
    }
    else if (_network === 5) {
        // for Bitcoin (Mainnet)
        return (yield (0, utils_1.getEstimatedFeesBitcoinMain)());
    }
    else if (_network === 10) {
        // for Bitcoin (Testnet)
        return (yield (0, utils_1.getEstimatedFeesBitcoinTest)());
    }
    else {
        return { data: "", message: "Wrong Network Selected", status: false };
    }
});
exports.getGasFees = getGasFees;
// 8 ) Get Transaction History
const getTransactionsHistory = (_network, _account) => __awaiter(void 0, void 0, void 0, function* () {
    let response = { data: null, message: "", status: false };
    try {
        if (_network === 1 || _network === 2 || _network === 3 || _network === 6 || _network === 7 || _network === 8) {
            return yield (0, utils_1.getTransactionsForEVM)(_network, _account);
        }
        else if (_network === 4) {
            // for Tron (Mainnet)
            return (yield (0, utils_1.getTransactionsFromTatumMain)("tron", _account));
        }
        else if (_network === 9) {
            // for Tron (Testnet)
            return (yield (0, utils_1.getTransactionsFromTatumTest)("tron", _account));
        }
        else if (_network === 5) {
            // for Bitcoin (Mainnet)
            return (yield (0, utils_1.getTransactionsFromTatumMain)("bitcoin", _account));
        }
        else if (_network === 10) {
            // for Bitcoin (Testnet)
            return (yield (0, utils_1.getTransactionsFromTatumTest)("bitcoin", _account));
        }
        else {
            return { data: "", message: "Wrong Network Selected", status: false };
        }
    }
    catch (e) {
        console.log(e, "Error while fetching transactions");
        return { data: e, message: "Error while fetching transactions", status: false };
    }
});
exports.getTransactionsHistory = getTransactionsHistory;
