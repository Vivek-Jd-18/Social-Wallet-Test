import { _fetchAccountsByIndex, _importBitcoinAccountFromPrivateKeyMain, _importBitcoinAccountFromPrivateKeyTest, _importEthereumAccountFromPrivateKey, _importTronAccountFromPrivateKey, getEstimatedFeesBitcoinMain, getEstimatedFeesBitcoinTest, getEthereumBalance, getEthereumGasPrice, getMainnetBitcoinBalance, getTestnetBitcoinBalance, getTransactionsForEVM, getTransactionsFromTatumMain, getTransactionsFromTatumTest, getTronBalanceMain, getTronBalanceTest, getTronResourceConsumption, isValidAddress, sendEVMNativeTokens, sendNativeTronMain, sendNativeTronTest, transferBitcoin } from "./utils";
import { utils } from "ethers";
const { randomBytes } = require("crypto");
const Wallet = require("wallet.ts");
const bip39 = require("@scure/bip39");
import * as ecc from 'tiny-secp256k1';
import { estimateGasFeesType, sendNativeType, transactionType } from "./types";

// 1 ) Create Wallet Function
export const createWallet = (env: string) => {
    try {
        const mnemonic = Wallet.Mnemonic.generate(randomBytes(16));
        const phrase = mnemonic.phrase;
        const seed = mnemonic.toSeed();
        const data2 = bip39.mnemonicToSeedSync(phrase, "");
        return _fetchAccountsByIndex(phrase, 0, env);
    } catch (e: any) {
        return e;
    }
};
// Test
// CreateWallet("mainnet");

// 2 ) Import an Account From Private Key
export const importAnyAccountFromPrivateKey = async (_network: number, _privateKey: string) => {
    try {

        if (_network === 1 || _network === 2 || _network === 3 || _network === 6 || _network === 7 || _network === 8) {
            // for Ethereum, Binance and Polygon (Mainnet and Testnet)
            return await _importEthereumAccountFromPrivateKey(_privateKey);
        } else if (_network === 4 || _network === 9) {
            // for Tron (Mainnet and Testnet)
            return await _importTronAccountFromPrivateKey(_privateKey);
        } else if (_network === 5) {
            // for Bitcoin (Mainnet)
            return await _importBitcoinAccountFromPrivateKeyMain(_privateKey);
        } else if (_network === 10) {
            // for Bitcoin (Testnet)
            return await _importBitcoinAccountFromPrivateKeyTest(_privateKey);
        } else {
            return "Wrong Network Selected";
        }
    } catch (e: any) {
        return `unknown error: ${e}`;
    }
}
// Test
// importAnyAccountFromPrivateKey(5,"L4oomL38goyFwNMKcd6GcZu9ScW76RSUjQAw1j2Z6T6QUoCaeECE")

// 3 ) Import an Account From Secret Phrase
export async function importAccountFromPhrase(
    _phrase: string,
    _env: string
) {
    const res = utils.isValidMnemonic(_phrase);
    if (!res) {
        return "Invalid Phrase, please check again";
    }
    return _fetchAccountsByIndex(_phrase, 0, _env);
}

// 4 ) Import an Account From Secret Phrase and Index
export const importAccountFromPhraseAndIndex = async (
    _phrase: string,
    _index: number,
    _env: string
) => {
    const res = utils.isValidMnemonic(_phrase);
    if (!res) {
        return "Invalid Phrase, please check again";
    }
    return _fetchAccountsByIndex(_phrase, _index, _env);
}

// 5 ) Get Balance of Native Token ~ Pendng (haved to fix EVM bal by Moralis)
export const getBalance = async (_address: string, _network: number) => {
    const validAddress: boolean = await isValidAddress(_address, _network);
    if (!validAddress) {
        return "Invalid Address";
    }
    if (_network === 1 || _network === 2 || _network === 3 || _network === 6 || _network === 7 || _network === 8) {
        // for Ethereum, Binance and Polygon (Mainnet and Testnet)
        console.log("For EVM");
        return { balance: await getEthereumBalance(_address, _network) };
    } else if (_network === 4 || _network === 9) {
        // for Tron (Mainnet)
        console.log("For TRON MAIN");
        return await getTronBalanceMain(_address);
    } else if (_network === 4 || _network === 9) {
        // for Tron (Testnet)
        console.log("For TRON TEST");
        return await getTronBalanceTest(_address);
    } else if (_network === 5) {
        // for Bitcoin (Mainnet)
        console.log("For BITCOIN MAIN");
        return await getMainnetBitcoinBalance(_address);
    } else if (_network === 10) {
        // for Bitcoin (Testnet)
        console.log("For BITCOIN TEST");
        return await getTestnetBitcoinBalance(_address);
    } else {
        return "Wrong Network Selected";
    }
}

// 6 ) send Native Token ~ Pending (Have to fix Sednig EVM token response)
export const sendNativeTokens = async (_fromAddress: string, _privateKey: string, _toAddress: string, _amount: number, _network: number): Promise<sendNativeType> => {
    if (_network === 1 || _network === 2 || _network === 3 || _network === 6 || _network === 7 || _network === 8) {
        // for Ethereum, Binance and Polygon (Mainnet and Testnet)
        console.log("Sending EVM Tokens, please wait...");
        const _evmRes: sendNativeType = await sendEVMNativeTokens(_fromAddress, _privateKey, _toAddress, _amount.toString(), _network);
        console.log(_evmRes, "_evmRes")
        return _evmRes;
    } else if (_network === 4) {
        // for Tron (Mainnet)
        console.log("Sending TRON Main Tokens, please wait...");
        return await sendNativeTronMain(_privateKey, Number(_amount), _toAddress);
    } else if (_network === 9) {
        // for Tron (Testnet)
        console.log("Sending TRON Test Tokens, please wait...");
        return await sendNativeTronTest(_privateKey, Number(_amount), _toAddress);
    } else if (_network === 5) {
        // for Bitcoin (Mainnet)
        console.log("Sending Bitcoin Main Tokens, please wait...");
        return await transferBitcoin(_privateKey, _amount, _toAddress, "mainnet", _fromAddress, ecc);
    } else if (_network === 10) {
        // for Bitcoin (Testnet)
        console.log("Sending Bitcoin Test Tokens, please wait...");
        return await transferBitcoin(_privateKey, _amount, _toAddress, "testnet", _fromAddress, ecc);
    } else {
        return { data: "", message: "Wrong Network Selected", status: false };
    }
}

// 7 ) Estimate Gas Fees
export const getGasFees = async (_network: number, _fromAddress: string, _privateKey: string, _toAddress: string, _amount: number | string): Promise<estimateGasFeesType> => {
    if (_network === 1 || _network === 2 || _network === 3 || _network === 6 || _network === 7 || _network === 8) {
        // for Ethereum, Binance and Polygon (Mainnet and Testnet)
        return getEthereumGasPrice(_network, _privateKey, _toAddress, _amount);
    } else if (_network === 4 || _network === 9) {
        // for Tron (Mainnet/Testnet)
        return getTronResourceConsumption(_fromAddress, _toAddress, _amount);
    } else if (_network === 5) {
        // for Bitcoin (Mainnet)
        return (await getEstimatedFeesBitcoinMain());
    } else if (_network === 10) {
        // for Bitcoin (Testnet)
        return (await getEstimatedFeesBitcoinTest());
    } else {
        return { data: "", message: "Wrong Network Selected", status: false };
    }
}


// 8 ) Get Transaction History
export const getTransactionsHistory = async (_network: number, _account: string): Promise<transactionType> => {
    let response: transactionType = { data: null, message: "", status: false };
    try {
        if (_network === 1 || _network === 2 || _network === 3 || _network === 6 || _network === 7 || _network === 8) {
            return await getTransactionsForEVM(_network, _account);
        } else if (_network === 4) {
            // for Tron (Mainnet)
            return (await getTransactionsFromTatumMain("tron", _account));
        } else if (_network === 9) {
            // for Tron (Testnet)
            return (await getTransactionsFromTatumTest("tron", _account));
        } else if (_network === 5) {
            // for Bitcoin (Mainnet)
            return (await getTransactionsFromTatumMain("bitcoin", _account));
        } else if (_network === 10) {
            // for Bitcoin (Testnet)
            return (await getTransactionsFromTatumTest("bitcoin", _account));
        } else {
            return { data: "", message: "Wrong Network Selected", status: false };
        }
    } catch (e: any) {
        console.log(e, "Error while fetching transactions");
        return { data: e, message: "Error while fetching transactions", status: false };
    }
}