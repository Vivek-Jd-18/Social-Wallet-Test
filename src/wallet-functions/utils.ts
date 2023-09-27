import { chainHexObj, setProvider } from "./chainHelpers";
import axios from "axios";
import { transferBTC } from "./bitCoinHelper";
import { estimateGasFeesType, sendNativeType, transactionType } from "./types";
import Moralis from "moralis";
const { errors, ethers, utils } = require("ethers");
const { HDKey } = require("wallet.ts");
const Wallet = require("wallet.ts");
const bitcoin = require("bitcoinjs-lib");
const bip39 = require("@scure/bip39");
const TronWeb = require("tronweb");


export function _fetchAccountsByIndex(phrase: any, index: number, env: string) {
    const seed = bip39.mnemonicToSeedSync(phrase, "");
    const bitcoinseed = Buffer.from(seed);
    const bitcoinWallet = BitcoinWallet(bitcoinseed, index, env);
    const etherwallet = Etherwallet(seed, index);
    const tronwallet = Tronwallet(seed, index);
    // console.log(phrase, bitcoinWallet, etherwallet, tronwallet);
    return {
        phrase,
        bitcoinWallet,
        etherwallet,
        tronwallet,
    };
}


// Create Bitcoin Wallet
function BitcoinWallet(seed: any, index: number, env: string) {
    if (env == "testnet") {
        const path = "m/44'/1'/0'/0/" + index;
        const network = bitcoin.networks.testnet;
        const masterNode = bitcoin.bip32.fromSeed(seed, network);
        const child = masterNode.derivePath(path);
        const BitcoinPrivateKey = child.toWIF();
        const keyPair = bitcoin.ECPair.fromWIF(BitcoinPrivateKey, network);
        const { address } = bitcoin.payments.p2pkh({
            pubkey: keyPair.publicKey,
            network: network,
        });
        // console.log(address, "bitcoin address");
        const BitcoinPublicKey = keyPair.publicKey?.toString("hex");

        // console.log(
        //   BitcoinPublicKey,
        //   "BitcoinPublicKeyBitcoinPublicKeyBitcoinPublicKey"
        // );
        // console.log(BitcoinPrivateKey, "bitcoin PrivateKey");
        return {
            address,
            BitcoinPublicKey,
            BitcoinPrivateKey,
        };
    } else if (env == "mainnet") {
        const path = "m/44'/0'/0'/0/" + index;
        const network = bitcoin.networks.bitcoin;
        const masterNode = bitcoin.bip32.fromSeed(seed, network);
        const child = masterNode.derivePath(path);
        const BitcoinPrivateKey = child.toWIF();
        // console.log("tututut",BitcoinPrivateKey);

        const keyPair = bitcoin.ECPair.fromWIF(BitcoinPrivateKey, network);
        const BitcoinPublicKey = child.publicKey?.toString("hex");
        const { address } = bitcoin.payments.p2pkh({
            pubkey: keyPair.publicKey,
            network: network,
        });
        // console.log(address, "bitcoin address");
        // console.log(
        //   BitcoinPublicKey,
        //   "BitcoinPublicKeyBitcoinPublicKeyBitcoinPublicKey"
        // );
        // console.log(BitcoinPrivateKey, "bitcoin PrivateKey");
        return {
            address,
            BitcoinPublicKey,
            BitcoinPrivateKey,
        };
    } else {
        console.log("Error 404..");
    }
}

// Create Ethereum Wallet
function Etherwallet(seed: any, index: number) {
    const masterKey = HDKey.parseMasterSeed(seed);
    const EthereumextendedPrivateKey: String | null =
        masterKey.derive("m/44'/60'/0'/0").extendedPrivateKey;
    const EthereumchildKey = HDKey.parseExtendedKey(
        String(EthereumextendedPrivateKey)
    );
    const Ethereumwallet = EthereumchildKey.derive(index.toString());
    const EthereumwalletPrivateKey = Ethereumwallet.privateKey;
    const EthereumwalletPublicKey = Ethereumwallet.publicKey;
    const EthereumWalletPrivateKeyHex = EthereumwalletPrivateKey?.toString("hex");
    const EthereumWalletPublicKeyHex = EthereumwalletPublicKey?.toString("hex");
    const EthereumAddress = Wallet.EthereumAddress.from(
        EthereumwalletPublicKey
    ).address;
    // console.log(EthereumAddress, "ethereum address");
    // console.log(EthereumWalletPublicKeyHex, "ethereum publickey");
    // console.log(EthereumWalletPrivateKeyHex, "ethereum private key");
    return {
        EthereumAddress,
        EthereumWalletPublicKeyHex,
        EthereumWalletPrivateKeyHex,
    };
}

// Create Tron Wallet
function Tronwallet(seed: any, index: number) {
    const masterKey = HDKey.parseMasterSeed(seed);
    const TronextendedPrivateKey: String | null =
        masterKey.derive("m/44'/195'/0'/0").extendedPrivateKey;
    const TronchildKey = HDKey.parseExtendedKey(String(TronextendedPrivateKey));
    const tronwallet = TronchildKey.derive(index.toString());
    const TronWalletPrivateKey = tronwallet.privateKey?.toString("hex");
    const TronWalletPublicKey = tronwallet.publicKey?.toString("hex");
    const TronAddress = TronWeb.address.fromPrivateKey(TronWalletPrivateKey);
    // console.log("----------------------------");
    // console.log(TronAddress, "TronAddress");
    // console.log(TronWalletPublicKey, "TronWalletPublicKey");
    // console.log(TronWalletPrivateKey, "TronWalletPrivateKey");
    return {
        TronAddress,
        TronWalletPublicKey,
        TronWalletPrivateKey,
    };
}

export const _importEthereumAccountFromPrivateKey = async (
    _privateKey: string
) => {
    try {
        if (!isValidPrivateKey(_privateKey)) {
            return ('invalid private key')
        }
        const wallet = new ethers.Wallet(_privateKey);
        console.log(await wallet.getAddress());
        return ({ publicAddress: await wallet.getAddress() });
    } catch (e: any) {
        return `Please use a valid Private key for Ethereum Networks ${e}`
    }
};
function isValidPrivateKey(privateKey:any) {
    try {
        // Create an instance of Wallet from the private key
        const wallet = new ethers.Wallet(privateKey);

        // Check if the address associated with the private key is valid
        if (ethers.utils.isAddress(wallet.address)) {
            return true; // Valid private key
        } else {
            return false; // Invalid private key
        }
    } catch (error) {
        return false; // Invalid private key
    }
}

export const _importTronAccountFromPrivateKey = (_privateKey: string) => {
    try {
        if (!isValidTronPrivateKey(_privateKey)) {
            return "Invalid Tron PrivateKey"
        }
        const TronAddress = TronWeb.address.fromPrivateKey(_privateKey);
        console.log(TronAddress, "TronAddress");
        return { publicAddress: TronAddress };
    } catch (e: any) {
        return `Please use Valid Private key for Tron Network ${e}`
    }
};

export const isValidTronPrivateKey = async (privateKey:any) => {
    // Check if the private key is a hexadecimal string
    const isHex = /^[0-9A-Fa-f]{64}$/.test(privateKey);

    return isHex;
}

export const _importBitcoinAccountFromPrivateKeyMain = (privateKey: string) => {
    try {
        const network = bitcoin.networks.bitcoin;
        const keyPair = bitcoin.ECPair.fromWIF(privateKey, network);
        const { pubkey, address } = bitcoin.payments.p2pkh({
            pubkey: keyPair.publicKey,
        });
        const publicKey = pubkey?.toString("hex") || "";
        console.log({ publicAddress: address, _publicKey: publicKey, _privateKey: privateKey });
        return { publicAddress: address };
    } catch (e: any) {
        return `  Please use a valid Private key for Bitcoin Mainnet Network ,${e}`;
    }
};

export const _importBitcoinAccountFromPrivateKeyTest = (privateKey: string) => {
    try {
        const network = bitcoin.networks.testnet;
        const keyPair = bitcoin.ECPair.fromWIF(privateKey, network);
        const { address } = bitcoin.payments.p2pkh({
            pubkey: keyPair.publicKey,
            network: network,
        });
        // console.log({
        //     publicAddress: address,
        //     _publicKey: keyPair.publicKey.toString("hex"),
        //     _privateKey: privateKey,
        // })
        return {
            publicAddress: address
        };
    } catch (e: any) {
        return `  Please use a valid Private key for Bitcoin Testnet Network ,${e}`;
    }
}

function isValidEthereumAddress(address: string) {
    try {
        // Check if the address has the correct length and is a valid checksum address
        const validAddress = ethers.utils.getAddress(address);
        // Compare the formatted address with the input address
        // console.log(validAddress.toLowerCase() === address.toLowerCase(),"validAddressvalidAddressvalidAddressvalidAddress")
        return validAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
        return false;
    }
}

function isValidTronAddress(address: string, network: "mainnet" | "testnet"): boolean {
    try {
        // Initialize TronWeb with the appropriate network
        const tronWeb = new TronWeb({
            fullHost: network === "mainnet" ? "https://api.trongrid.io" : "https://api.shasta.trongrid.io",
        });

        // Check if the address is valid
        const isValid = tronWeb.isAddress(address);

        return isValid;
    } catch (error) {
        // Handle any exceptions
        return false;
    }
}

function isValidBitcoinAddress(address: string): boolean {
    try {
        // Parse the address using the library
        const decodedAddress = bitcoin.address.fromBase58Check(address);

        // Check if the address version byte is 0 (mainnet)
        return decodedAddress.version === 0;
    } catch (error) {
        // If an error occurs during parsing, it's an invalid address
        return false;
    }
}

function isValidBitcoinTestnetAddress(address: string): boolean {
    try {
        // Parse the address using the library
        const decodedAddress = bitcoin.address.fromBase58Check(address);

        // Check if the address version byte is 111 (testnet)
        return decodedAddress.version === 111;
    } catch (error) {
        // If an error occurs during parsing, it's an invalid address
        return false;
    }
}


export const isValidAddress = async (_address: string, _network: number) => {
    if (_network === 1 || _network === 2 || _network === 3 || _network === 6 || _network === 7 || _network === 8) {
        // for Ethereum, Binance and Polygon (Mainnet and Testnet)
        const isValid = isValidEthereumAddress(_address);
        if (!isValid) {
            console.log('Invalid Ethereum address.');
            return false;
        } else {
            return true;
        }
    } else if (_network === 4 || _network === 9) {
        // for Tron (Mainnet and Testnet)
        const network = "mainnet";
        const isValid = isValidTronAddress(_address, network);
        if (!isValid) {
            console.log("Invalid Tron address.");
            return false;
        } else {
            return true;
        }
    } else if (_network === 5) {
        // for Bitcoin (Mainnet)
        if (!isValidBitcoinAddress(_address)) {
            console.log('Invalid Bitcoin mainnet address.');
            return false;
        } else {
            return true;
        }
    } else if (_network === 10) {
        // for Bitcoin (Testnet)
        if (!isValidBitcoinTestnetAddress(_address)) {
            console.log('Invalid Bitcoin testnet address.');
            return false;
        } else {
            return true;
        }
    } else {
        return false;
    }
}

export const getEthereumBalance = async (_address: string, _network: number) => {
    try {
        const _provider = await setProvider(_network);
        const balance = await (_provider.getBalance(_address));
        console.log("EVM Balance", balance.toString());
        return balance.toString();
    } catch (e: any) {
        console.log("Error while fetching balance for EVM n/w", e)
        return -1;
    }
}

export async function getTronBalanceTest(address: string) {
    const HttpProvider = TronWeb.providers.HttpProvider;
    const fullNode = new HttpProvider("https://api.nileex.io");
    const solidityNode = new HttpProvider("https://api.nileex.io");
    const eventServer = new HttpProvider("https://api.nileex.io");
    const tronWeb = new TronWeb(fullNode, solidityNode, eventServer);
    const _balance = await tronWeb.trx.getBalance(address);
    return _balance;
}

export async function getTronBalanceMain(address: string) {
    const HttpProvider = TronWeb.providers.HttpProvider;
    const fullNode = new HttpProvider("https://api.trongrid.io");
    const solidityNode = new HttpProvider("https://api.trongrid.io");
    const eventServer = new HttpProvider("https://api.trongrid.io");
    const tronWeb = new TronWeb(fullNode, solidityNode, eventServer);
    const _balance = await tronWeb.trx.getBalance(address);
    return _balance;
}

export async function getMainnetBitcoinBalance(_address: string) {
    let result: number | string = "";
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.tatum.io/v3/bitcoin/address/balance/${_address}`,
        headers: {
            'x-api-key': (process.env.TATUM_API_KEY_MAIN)?.toString()
        }
    };

    axios.request(config)
        .then((response) => {
            console.log(JSON.stringify(response.data));
            console.log("Available Balanace ", JSON.stringify(parseFloat(response.data.incoming) + parseFloat(response.data.incoming)));
            let data = parseFloat(response.data.incoming) - parseFloat(response.data.outgoing)
            console.log(data)
            result = data;
        })
        .catch((error) => {
            console.log(error);
        });
    return result;
}

export async function getTestnetBitcoinBalance(_address: string) {
    let result: number | string = "";
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://api.tatum.io/v3/bitcoin/address/balance/${_address}`,
        headers: {
            'x-api-key': (process.env.TATUM_API_KEY_TEST)?.toString()
        }
    };

    axios.request(config)
        .then((response) => {
            console.log(JSON.stringify(response.data));
            console.log("Available Balanace ", JSON.stringify(parseFloat(response.data.incoming) + parseFloat(response.data.incoming)));
            let data = parseFloat(response.data.incoming) - parseFloat(response.data.outgoing)
            console.log(data)
            result = data;
        })
        .catch((error) => {
            console.log(error);
        });
    return result;
}

export const sendEVMNativeTokens = async (_fromAddress: string, _privateKey: string, _toAddress: string, _amount: string, _network: number): Promise<sendNativeType> => {
    let _resposne: sendNativeType = { data: "", message: "", status: false };
    try {
        const wallet = new ethers.Wallet((_privateKey).toString());
        const _provider = await setProvider(_network);
        const walletSigner = wallet.connect(_provider);
        const etherBalance = await getEthereumBalance(_fromAddress, _network);
        const balance = await (_provider.getBalance(_fromAddress));
        console.log(Number((balance).toString()) / (10 ** 18), "user account balance");

        if (_provider) {
            if (Number(balance) / (10 ** 18) > Number(_amount)) {
                _provider.getGasPrice().then(async (currentGasPrice: any) => {
                    const gas_price = ethers.utils.hexlify((currentGasPrice));
                    if (etherBalance > ethers.utils.hexlify(gas_price)) {
                        const gas_limit: any = 100000;
                        const tx = {
                            from: _fromAddress,
                            to: _toAddress,
                            value: ethers.utils.parseEther((_amount).toString()),
                            nonce: _provider.getTransactionCount(
                                _fromAddress,
                                "latest"
                            ),
                            gasLimit: ethers.utils.hexlify(gas_limit), // 100000
                            gasPrice: gas_price,
                        }
                        try {
                            const response: any = await walletSigner.sendTransaction(tx);
                            console.log("_+__+_++__++_+__+_++_+__+", await response, "_+__+_++__++_+__+_++_+__+");
                            _resposne = { message: "Native Token Sent Successfully", data: await response, status: true };
                            return _resposne;
                        } catch (error: any) {
                            console.log("failed to send!!");
                            _resposne = { message: "Failed to Complete Send", data: error, status: false };
                            return _resposne;
                        }
                    } else {
                        console.log("Low ETH Balance - Please Deposit ETH to Complete Transaction");
                        _resposne = { message: "Low ETH Balance - Please Deposit ETH to Complete Transaction", data: "", status: false };
                        return _resposne;
                    }
                }).catch((e: any) => {
                    console.log("Error while Fetching gasPrice", e);
                    _resposne = { message: "Error while Fetching gasPrice", data: e, status: false };
                    return _resposne;
                })
            } else {
                _resposne = { message: "Transfer Amount Exceeds Balance", data: "", status: false };
                return _resposne;
            }
        } else {
            console.log("couldn't get the provider");
            _resposne = { message: "couldn't get the provider", data: "", status: false };
            return _resposne;
        }
    } catch (error) {
        console.log(error, "Unknown Error while Sending Tokens");
        _resposne = { message: "Unknown Error while Sending Tokens", data: "", status: false };
        return _resposne;
    }
    return _resposne;
}

export async function sendNativeTronMain(_fromPrivateKey: string, _amount: number, _receiverAddress: string): Promise<sendNativeType> {
    let response: sendNativeType = { data: "", status: false, message: "" };
    const HttpProvider = TronWeb.providers.HttpProvider;

    const mainNetFullNode = new HttpProvider("https://api.trongrid.io");
    const mainNetSolidityNode = new HttpProvider("https://api.trongrid.io");
    const mainNetEventServer = new HttpProvider("https://api.trongrid.io");

    const tronWeb = new TronWeb(
        (mainNetFullNode),
        (mainNetSolidityNode),
        (mainNetEventServer), _fromPrivateKey
    );
    const SUN = 1000000;
    tronWeb.trx.sendTransaction(_receiverAddress, _amount * SUN, _fromPrivateKey).then((res: any) => {
        response = { data: res, message: "Token Sent Successfully", status: false };
    }).catch((err: any) => {
        response = { data: err, message: "Something Went Wrong while sending Tron Tokens", status: true };
    })
    return response;
}

// Tron for Nile network
export async function sendNativeTronTest(_fromPrivateKey: string, _amount: number, _receiverAddress: string): Promise<sendNativeType> {
    let response: sendNativeType = { data: "", status: false, message: "" };
    try {
        const HttpProvider = TronWeb.providers.HttpProvider;
        const testNetFullNode = new HttpProvider("https://api.nileex.io");
        const testNetSolidityNode = new HttpProvider("https://api.nileex.io");
        const testNetEventServer = new HttpProvider("https://api.nileex.io");

        const tronWeb = new TronWeb(
            (testNetFullNode),
            (testNetSolidityNode),
            (testNetEventServer), _fromPrivateKey
        );
        const SUN = 1000000;
        const res: any = await tronWeb.trx.sendTransaction(_receiverAddress, _amount * SUN, _fromPrivateKey)
        response = { data: await res, message: "Token Sent Successfully", status: false };
        return response;
    } catch (err: any) {
        response = { data: await err, message: "Something Went Wrong while sending Tron Tokens", status: true };
        return response;
    }
}

// send Mainnet/Testnet Bitcoin
export const transferBitcoin = async (
    privateKey: string,
    value: number,
    receiver: string,
    env: string,
    address: string,
    ecc: any
) => {
    return await transferBTC(privateKey, value, receiver, env, address, ecc);
};


export async function getEthereumGasPrice(_chainId: string | number, _privateKey: string, _toAddress: string, _amount: string | number): Promise<estimateGasFeesType> {
    try {
        const _provider = await setProvider(_chainId);
        const gasPrice: any = await _provider.getGasPrice();
        const convertedPrice: string | number = utils.formatUnits(gasPrice, "gwei");
        const wallet = new ethers.Wallet((_privateKey).toString());
        const walletSigner = wallet.connect(_provider);
        const estimatedGas = await walletSigner.estimateGas({
            to: _toAddress.toString(),
            value: _amount.toString(),
        });
        const gasFees = estimatedGas.mul(gasPrice);
        const gasFeesInEther = ethers.utils.formatEther(gasFees);
        console.log({ gasPrice: convertedPrice, gasFees: gasFees, gasFeesInEther: gasFeesInEther });
        return { data: { gasPrice: convertedPrice, gasFees: gasFees, gasFeesInEther: gasFeesInEther }, message: "", status: true };
    } catch (e: any) {
        return { data: e, message: "couldn't get gas fees", status: false };
    }
}


export const getTronResourceConsumption = async (
    _sender: string,
    _to: string,
    _amount: string | number
): Promise<estimateGasFeesType> => {
    try {
        const transaction = {
            sender: _sender,
            receiver: _to,
            amount: _amount,
        };
        const rawData = Buffer.from(JSON.stringify(transaction));
        const bandwidth = rawData.length + 128;
        const sunRequired = bandwidth * 10;
        const trxRequired = sunRequired / 1000000;

        console.log("Bandwidth:", bandwidth);
        console.log("SUN required:", sunRequired);
        console.log("TRX required:", trxRequired);
        return { data: { bandwidth, sunRequired, }, message: "gasFees Fetched..!", status: true };
    }
    catch (e: any) {
        return {
            data: e,
            message: "Couldn't fetch gasFees",
            status: false,
        }
    }
}

export const getEstimatedFeesBitcoinTest = async (): Promise<estimateGasFeesType> => {
    try {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://api.tatum.io/v3/blockchain/fee/BTC`,
            headers: {
                'x-api-key': (process.env.TATUM_API_KEY_TEST)?.toString()
            }
        };
        const data: any = await axios.request(config)
        const gasefees = {
            Fast: (data.data.fast * 0.00000001) * 256,
            Medium: (data.data.medium * 0.00000001) * 256,
            Slow: (data.data.slow * 0.00000001) * 256
        }
        return { data: gasefees, message: "gasFees Fetched..!", status: true };
    } catch (e: any) {
        return { data: e, message: "Couldn't fetch gasFees", status: false };
    }
}

export const getEstimatedFeesBitcoinMain = async () => {
    try {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://api.tatum.io/v3/blockchain/fee/BTC`,
            headers: {
                'x-api-key': (process.env.TATUM_API_KEY_MAIN)?.toString()
            }
        };
        const data: any = await axios.request(config)
        const gasefees = {
            Fast: (data.data.fast * 0.00000001) * 256,
            Medium: (data.data.medium * 0.00000001) * 256,
            Slow: (data.data.slow * 0.00000001) * 256
        }
        return { data: data, message: "gasFees Fetched..!", status: true };
    } catch (e: any) {
        return { data: e, message: "Couldn't fetch gasFees", status: false };
    }
}


export const getNetworkHex = () => {

}


// fetch Transactions for EVM chains(Tesnet-Mainnet)
export const getTransactionsForEVM = async (
    _network: number,
    _account: string
): Promise<transactionType> => {
    let response: transactionType = { data: null, message: "", status: false };
    try {
        const _response = await Moralis.EvmApi.transaction.getWalletTransactions({
            chain: (_network === 1 ? chainHexObj["eth"] : _network === 2 ? chainHexObj["bsc"] :
                _network === 3 ? chainHexObj["polygon"] : _network === 6 ?
                    chainHexObj["sepolia"] : _network === 7 ? chainHexObj["bsc_testnet"] : chainHexObj["mumbai"]).toString(),
            address: _account.toString(),
        });
        response = { data: _response, message: "transactions fetched!", status: true };
        return response;
    } catch (e: any) {
        console.log("Error while Fetching bitcoin Transactions");
        return e;
    }
};


// _chain should be from => ethereum ,tron, polygon, bitcoin for Main-net
export const getTransactionsFromTatumMain = async (
    _chain: string,
    _address: string
): Promise<transactionType> => {
    let url = "";
    if (_chain === "ethereum" || _chain === "polygon") {
        url = `https://api.tatum.io/v3/${_chain}/account/transaction/${_address}?pageSize=10`;
    } else if (_chain === "tron") {
        url = `https://api.tatum.io/v3/${_chain}/transaction/account/${_address}`;
    } else if (_chain === "bitcoin") {
        url = `https://api.tatum.io/v3/${_chain}/transaction/address/${_address}?pageSize=10`;
    } else {
        return { data: null, message: "Wrong Network Selected", status: false };
    }
    let response: transactionType = { data: null, message: "", status: false };

    try {
        let config = {
            method: "get",
            maxBodyLength: Infinity,
            url: url, // Use the determined URL here
            headers: {
                "x-api-key": (process.env.TATUM_API_KEY_MAIN)?.toString(),
            },
        };
        await axios.request(config).then((axiosResponse: any) => {
            // console.log(JSON.stringify(axiosResponse.data), "data"); 
            response = { data: JSON.stringify(axiosResponse.data), message: "Transaction fetched..!", status: true };
            return response;
        }).catch((error) => {
            console.log(error);
            response = { data: error, message: "Unexpected Error while getting Tron Trnmsactions", status: false };
            return response;
        });
    } catch (e: any) {
        console.log("Error while fetching Transactions from TATUM", e);
        response = { data: e, message: "Unexpected Error while getting Tron Trnmsactions", status: false };
        return response;
    }
    return response;
};


// _chain should be from => ethereum ,tron, polygon, bitcoin
export const getTransactionsFromTatumTest = async (
    _chain: string,
    _address: string
) => {
    let url = "";

    if (_chain === "ethereum" || _chain === "polygon") {
        url = `https://api.tatum.io/v3/${_chain}/account/transaction/${_address}?pageSize=10`;
    } else if (_chain === "tron") {
        url = `https://api.tatum.io/v3/${_chain}/transaction/account/${_address}`;
    } else if (_chain === "bitcoin") {
        url = `https://api.tatum.io/v3/${_chain}/transaction/address/${_address}?pageSize=10`;
    } else {
        return "Wrong Network Selected";
    }
    let response: any = "";

    try {
        let config = {
            method: "get",
            maxBodyLength: Infinity,
            url: url, // Use the determined URL here
            headers: {
                "x-api-key": (process.env.TATUM_API_KEY_TEST)?.toString(),
            },
        };

        axios
            .request(config)
            .then((axiosResponse: any) => {
                console.log(JSON.stringify(axiosResponse.data), "data");
                response = JSON.stringify(axiosResponse.data);
            })
            .catch((error) => {
                console.log(error);
                response = error;
            });

        return response;
    } catch (e: any) {
        console.log("Error while fetching Transactions from TATUM", e);
        response = e;
        return response;
    }
};