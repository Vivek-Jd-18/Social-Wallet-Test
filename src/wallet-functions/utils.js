"use strict";
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
exports.networkId = exports.getTransactionsFromTatumTest = exports.getTransactionsFromTatumMain = exports.getTransactionsForEVM = exports.getNetworkHex = exports.getEstimatedFeesBitcoinMain = exports.getEstimatedFeesBitcoinTest = exports.getTronResourceConsumption = exports.getEthereumGasPrice = exports.transferBitcoin = exports.sendNativeTronTest = exports.sendNativeTronMain = exports.sendEVMNativeTokens = exports.getTestnetBitcoinBalance = exports.getMainnetBitcoinBalance = exports.getTronBalanceMain = exports.getTronBalanceTest = exports.getEthereumBalance = exports.isValidAddress = exports._importBitcoinAccountFromPrivateKeyTest = exports._importBitcoinAccountFromPrivateKeyMain = exports.isValidTronPrivateKey = exports._importTronAccountFromPrivateKey = exports._importEthereumAccountFromPrivateKey = exports._fetchAccountsByIndex = void 0;
const chainHelpers_1 = require("./chainHelpers");
const axios_1 = __importDefault(require("axios"));
const bitCoinHelper_1 = require("./bitCoinHelper");
const moralis_1 = __importDefault(require("moralis"));
const { errors, ethers, utils } = require("ethers");
const { HDKey } = require("wallet.ts");
const Wallet = require("wallet.ts");
const bitcoin = require("bitcoinjs-lib");
const bip39 = require("@scure/bip39");
const TronWeb = require("tronweb");
function _fetchAccountsByIndex(phrase, index, env) {
    const seed = bip39.mnemonicToSeedSync(phrase, "");
    const bitcoinseed = Buffer.from(seed);
    const bitcoinWallet = BitcoinWallet(bitcoinseed, index, env);
    const ethereumWallet = Etherwallet(seed, index);
    const tronWallet = Tronwallet(seed, index);
    // //console.log(phrase, bitcoinWallet, etherwallet, tronwallet);
    return {
        phrase,
        bitcoinWallet,
        ethereumWallet,
        tronWallet
    };
}
exports._fetchAccountsByIndex = _fetchAccountsByIndex;
// Create Bitcoin Wallet
function BitcoinWallet(seed, index, env) {
    var _a, _b;
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
        // //console.log(address, "bitcoin address");
        const BitcoinPublicKey = (_a = keyPair.publicKey) === null || _a === void 0 ? void 0 : _a.toString("hex");
        // //console.log(BitcoinPublicKey,"BitcoinPublicKeyBitcoinPublicKeyBitcoinPublicKey");
        // //console.log(BitcoinPrivateKey, "bitcoin PrivateKey");
        return {
            bitcoinAddress: address,
            bitcoinPublicKey: BitcoinPublicKey,
            bitcoinPrivateKey: BitcoinPrivateKey
        };
    }
    else if (env == "mainnet") {
        const path = "m/44'/0'/0'/0/" + index;
        const network = bitcoin.networks.bitcoin;
        const masterNode = bitcoin.bip32.fromSeed(seed, network);
        const child = masterNode.derivePath(path);
        const BitcoinPrivateKey = child.toWIF();
        // //console.log("tututut",BitcoinPrivateKey);
        const keyPair = bitcoin.ECPair.fromWIF(BitcoinPrivateKey, network);
        const BitcoinPublicKey = (_b = child.publicKey) === null || _b === void 0 ? void 0 : _b.toString("hex");
        const { address } = bitcoin.payments.p2pkh({
            pubkey: keyPair.publicKey,
            network: network,
        });
        // //console.log(address, "bitcoin address");
        // //console.log(
        //   BitcoinPublicKey,
        //   "BitcoinPublicKeyBitcoinPublicKeyBitcoinPublicKey"
        // );
        // //console.log(BitcoinPrivateKey, "bitcoin PrivateKey");
        return {
            bitcoinAddress: address,
            bitcoinPublicKey: BitcoinPublicKey,
            bitcoinPrivateKey: BitcoinPrivateKey
        };
    }
    else {
        //console.log("Error 404..");
    }
}
// Create Ethereum Wallet
function Etherwallet(seed, index) {
    const masterKey = HDKey.parseMasterSeed(seed);
    const EthereumextendedPrivateKey = masterKey.derive("m/44'/60'/0'/0").extendedPrivateKey;
    const EthereumchildKey = HDKey.parseExtendedKey(String(EthereumextendedPrivateKey));
    const Ethereumwallet = EthereumchildKey.derive(index.toString());
    const EthereumwalletPrivateKey = Ethereumwallet.privateKey;
    const EthereumwalletPublicKey = Ethereumwallet.publicKey;
    const EthereumWalletPrivateKeyHex = EthereumwalletPrivateKey === null || EthereumwalletPrivateKey === void 0 ? void 0 : EthereumwalletPrivateKey.toString("hex");
    const EthereumWalletPublicKeyHex = EthereumwalletPublicKey === null || EthereumwalletPublicKey === void 0 ? void 0 : EthereumwalletPublicKey.toString("hex");
    const EthereumAddress = Wallet.EthereumAddress.from(EthereumwalletPublicKey).address;
    // //console.log(EthereumAddress, "ethereum address");
    // //console.log(EthereumWalletPublicKeyHex, "ethereum publickey");
    // //console.log(EthereumWalletPrivateKeyHex, "ethereum private key");
    return {
        ethereumAddress: EthereumAddress,
        ethereumPublicKey: EthereumWalletPublicKeyHex,
        ethereumPrivateKey: EthereumWalletPrivateKeyHex,
    };
}
// Create Tron Wallet
function Tronwallet(seed, index) {
    var _a, _b;
    const masterKey = HDKey.parseMasterSeed(seed);
    const TronextendedPrivateKey = masterKey.derive("m/44'/195'/0'/0").extendedPrivateKey;
    const TronchildKey = HDKey.parseExtendedKey(String(TronextendedPrivateKey));
    const tronwallet = TronchildKey.derive(index.toString());
    const TronWalletPrivateKey = (_a = tronwallet.privateKey) === null || _a === void 0 ? void 0 : _a.toString("hex");
    const TronWalletPublicKey = (_b = tronwallet.publicKey) === null || _b === void 0 ? void 0 : _b.toString("hex");
    const TronAddress = TronWeb.address.fromPrivateKey(TronWalletPrivateKey);
    // //console.log("----------------------------");
    // //console.log(TronAddress, "TronAddress");
    // //console.log(TronWalletPublicKey, "TronWalletPublicKey");
    // //console.log(TronWalletPrivateKey, "TronWalletPrivateKey");
    return {
        tronAddress: TronAddress,
        tronPublicKey: TronWalletPublicKey,
        tronPrivateKey: TronWalletPrivateKey
    };
}
const _importEthereumAccountFromPrivateKey = (_privateKey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!isValidPrivateKey(_privateKey)) {
            return ('invalid private key');
        }
        const wallet = new ethers.Wallet(_privateKey);
        //console.log(await wallet.getAddress());
        return ({ publicAddress: yield wallet.getAddress() });
    }
    catch (e) {
        return `Please use a valid Private key for Ethereum Networks ${e}`;
    }
});
exports._importEthereumAccountFromPrivateKey = _importEthereumAccountFromPrivateKey;
function isValidPrivateKey(privateKey) {
    try {
        // Create an instance of Wallet from the private key
        const wallet = new ethers.Wallet(privateKey);
        // Check if the address associated with the private key is valid
        if (ethers.utils.isAddress(wallet.address)) {
            return true; // Valid private key
        }
        else {
            return false; // Invalid private key
        }
    }
    catch (error) {
        return false; // Invalid private key
    }
}
const _importTronAccountFromPrivateKey = (_privateKey) => {
    try {
        if (!(0, exports.isValidTronPrivateKey)(_privateKey)) {
            return "Invalid Tron PrivateKey";
        }
        const TronAddress = TronWeb.address.fromPrivateKey(_privateKey);
        // //console.log(TronAddress, "TronAddress");
        return { publicAddress: TronAddress };
    }
    catch (e) {
        return `Please use Valid Private key for Tron Network ${e}`;
    }
};
exports._importTronAccountFromPrivateKey = _importTronAccountFromPrivateKey;
const isValidTronPrivateKey = (privateKey) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the private key is a hexadecimal string
    const isHex = /^[0-9A-Fa-f]{64}$/.test(privateKey);
    return isHex;
});
exports.isValidTronPrivateKey = isValidTronPrivateKey;
const _importBitcoinAccountFromPrivateKeyMain = (privateKey) => {
    try {
        const network = bitcoin.networks.bitcoin;
        const keyPair = bitcoin.ECPair.fromWIF(privateKey, network);
        const { pubkey, address } = bitcoin.payments.p2pkh({
            pubkey: keyPair.publicKey,
        });
        const publicKey = (pubkey === null || pubkey === void 0 ? void 0 : pubkey.toString("hex")) || "";
        // //console.log({ publicAddress: address, _publicKey: publicKey, _privateKey: privateKey });
        return { publicAddress: address };
    }
    catch (e) {
        return `  Please use a valid Private key for Bitcoin Mainnet Network ,${e}`;
    }
};
exports._importBitcoinAccountFromPrivateKeyMain = _importBitcoinAccountFromPrivateKeyMain;
const _importBitcoinAccountFromPrivateKeyTest = (privateKey) => {
    try {
        const network = bitcoin.networks.testnet;
        const keyPair = bitcoin.ECPair.fromWIF(privateKey, network);
        const { address } = bitcoin.payments.p2pkh({
            pubkey: keyPair.publicKey,
            network: network,
        });
        // //console.log({
        //     publicAddress: address,
        //     _publicKey: keyPair.publicKey.toString("hex"),
        //     _privateKey: privateKey,
        // })
        return {
            publicAddress: address
        };
    }
    catch (e) {
        return `  Please use a valid Private key for Bitcoin Testnet Network ,${e}`;
    }
};
exports._importBitcoinAccountFromPrivateKeyTest = _importBitcoinAccountFromPrivateKeyTest;
function isValidEthereumAddress(address) {
    try {
        // Check if the address has the correct length and is a valid checksum address
        const validAddress = ethers.utils.getAddress(address);
        // Compare the formatted address with the input address
        // //console.log(validAddress.toLowerCase() === address.toLowerCase(),"validAddressvalidAddressvalidAddressvalidAddress")
        return validAddress.toLowerCase() === address.toLowerCase();
    }
    catch (error) {
        return false;
    }
}
function isValidTronAddress(address, network) {
    try {
        // Initialize TronWeb with the appropriate network
        const tronWeb = new TronWeb({
            fullHost: network === "mainnet" ? "https://api.trongrid.io" : "https://api.shasta.trongrid.io",
        });
        // Check if the address is valid
        const isValid = tronWeb.isAddress(address);
        return isValid;
    }
    catch (error) {
        // Handle any exceptions
        return false;
    }
}
function isValidBitcoinAddress(address) {
    try {
        // Parse the address using the library
        const decodedAddress = bitcoin.address.fromBase58Check(address);
        // Check if the address version byte is 0 (mainnet)
        return decodedAddress.version === 0;
    }
    catch (error) {
        // If an error occurs during parsing, it's an invalid address
        return false;
    }
}
function isValidBitcoinTestnetAddress(address) {
    try {
        // Parse the address using the library
        const decodedAddress = bitcoin.address.fromBase58Check(address);
        // Check if the address version byte is 111 (testnet)
        return decodedAddress.version === 111;
    }
    catch (error) {
        // If an error occurs during parsing, it's an invalid address
        return false;
    }
}
const isValidAddress = (_address, _network) => __awaiter(void 0, void 0, void 0, function* () {
    if (_network === 1 || _network === 2 || _network === 3 || _network === 6 || _network === 7 || _network === 8) {
        // for Ethereum, Binance and Polygon (Mainnet and Testnet)
        const isValid = isValidEthereumAddress(_address);
        if (!isValid) {
            //console.log('Invalid Ethereum address.');
            return false;
        }
        else {
            return true;
        }
    }
    else if (_network === 4 || _network === 9) {
        // for Tron (Mainnet and Testnet)
        const network = "mainnet";
        const isValid = isValidTronAddress(_address, network);
        if (!isValid) {
            //console.log("Invalid Tron address.");
            return false;
        }
        else {
            return true;
        }
    }
    else if (_network === 5) {
        // for Bitcoin (Mainnet)
        if (!isValidBitcoinAddress(_address)) {
            //console.log('Invalid Bitcoin mainnet address.');
            return false;
        }
        else {
            return true;
        }
    }
    else if (_network === 10) {
        // for Bitcoin (Testnet)
        if (!isValidBitcoinTestnetAddress(_address)) {
            //console.log('Invalid Bitcoin testnet address.');
            return false;
        }
        else {
            return true;
        }
    }
    else {
        return false;
    }
});
exports.isValidAddress = isValidAddress;
const getEthereumBalance = (_address, _network) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _provider = yield (0, chainHelpers_1.setProvider)(_network);
        const balance = yield (_provider.getBalance(_address));
        //console.log("EVM Balance", balance.toString());
        return (balance / (10 ** 18)).toString();
    }
    catch (e) {
        //console.log("Error while fetching balance for EVM n/w", e)
        return "-1";
    }
});
exports.getEthereumBalance = getEthereumBalance;
function getTronBalanceTest(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const HttpProvider = TronWeb.providers.HttpProvider;
        const fullNode = new HttpProvider("https://api.nileex.io");
        const solidityNode = new HttpProvider("https://api.nileex.io");
        const eventServer = new HttpProvider("https://api.nileex.io");
        const tronWeb = new TronWeb(fullNode, solidityNode, eventServer);
        const _balance = yield tronWeb.trx.getBalance(address);
        return _balance;
    });
}
exports.getTronBalanceTest = getTronBalanceTest;
function getTronBalanceMain(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const HttpProvider = TronWeb.providers.HttpProvider;
        const fullNode = new HttpProvider("https://api.trongrid.io");
        const solidityNode = new HttpProvider("https://api.trongrid.io");
        const eventServer = new HttpProvider("https://api.trongrid.io");
        const tronWeb = new TronWeb(fullNode, solidityNode, eventServer);
        const _balance = yield tronWeb.trx.getBalance(address);
        return _balance;
    });
}
exports.getTronBalanceMain = getTronBalanceMain;
function getMainnetBitcoinBalance(_address) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let result = "";
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://api.tatum.io/v3/bitcoin/address/balance/${_address}`,
            headers: {
                'x-api-key': (_a = (process.env.TATUM_API_KEY_MAIN)) === null || _a === void 0 ? void 0 : _a.toString()
            }
        };
        axios_1.default.request(config)
            .then((response) => {
            //console.log(JSON.stringify(response.data));
            //console.log("Available Balanace ", JSON.stringify(parseFloat(response.data.incoming) + parseFloat(response.data.incoming)));
            let data = parseFloat(response.data.incoming) - parseFloat(response.data.outgoing);
            //console.log(data)
            result = data;
        })
            .catch((error) => {
            //console.log(error);
        });
        return result;
    });
}
exports.getMainnetBitcoinBalance = getMainnetBitcoinBalance;
function getTestnetBitcoinBalance(_address) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let result = "";
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://api.tatum.io/v3/bitcoin/address/balance/${_address}`,
            headers: {
                'x-api-key': (_a = (process.env.TATUM_API_KEY_TEST)) === null || _a === void 0 ? void 0 : _a.toString()
            }
        };
        axios_1.default.request(config)
            .then((response) => {
            //console.log(JSON.stringify(response.data));
            //console.log("Available Balanace ", JSON.stringify(parseFloat(response.data.incoming) + parseFloat(response.data.incoming)));
            let data = parseFloat(response.data.incoming) - parseFloat(response.data.outgoing);
            //console.log(data)
            result = data;
        })
            .catch((error) => {
            //console.log(error);
        });
        return result;
    });
}
exports.getTestnetBitcoinBalance = getTestnetBitcoinBalance;
const sendEVMNativeTokens = (_fromAddress, _privateKey, _toAddress, _amount, _network) => __awaiter(void 0, void 0, void 0, function* () {
    let _resposne = { data: "", message: "", status: false };
    try {
        const wallet = new ethers.Wallet((_privateKey).toString());
        const _provider = yield (0, chainHelpers_1.setProvider)(_network);
        const walletSigner = wallet.connect(_provider);
        const etherBalance = yield (0, exports.getEthereumBalance)(_fromAddress, _network);
        const balance = yield (_provider.getBalance(_fromAddress));
        //console.log(Number((balance).toString()) / (10 ** 18), "user account balance");
        if (_provider) {
            if (Number(balance) / (10 ** 18) > Number(_amount)) {
                _provider.getGasPrice().then((currentGasPrice) => __awaiter(void 0, void 0, void 0, function* () {
                    const gas_price = ethers.utils.hexlify((currentGasPrice));
                    if (etherBalance > ethers.utils.hexlify(gas_price)) {
                        const gas_limit = 100000;
                        const tx = {
                            from: _fromAddress,
                            to: _toAddress,
                            value: ethers.utils.parseEther((_amount).toString()),
                            nonce: _provider.getTransactionCount(_fromAddress, "latest"),
                            gasLimit: ethers.utils.hexlify(gas_limit),
                            gasPrice: gas_price,
                        };
                        try {
                            const response = yield walletSigner.sendTransaction(tx);
                            //console.log("_+__+_++__++_+__+_++_+__+", await response, "_+__+_++__++_+__+_++_+__+");
                            _resposne = { message: "Native Token Sent Successfully", data: yield response, status: true };
                            return _resposne;
                        }
                        catch (error) {
                            //console.log("failed to send!!");
                            _resposne = { message: "Failed to Complete Send", data: error, status: false };
                            return _resposne;
                        }
                    }
                    else {
                        //console.log("Low ETH Balance - Please Deposit ETH to Complete Transaction");
                        _resposne = { message: "Low ETH Balance - Please Deposit ETH to Complete Transaction", data: "", status: false };
                        return _resposne;
                    }
                })).catch((e) => {
                    //console.log("Error while Fetching gasPrice", e);
                    _resposne = { message: "Error while Fetching gasPrice", data: e, status: false };
                    return _resposne;
                });
            }
            else {
                _resposne = { message: "Transfer Amount Exceeds Balance", data: "", status: false };
                return _resposne;
            }
        }
        else {
            //console.log("couldn't get the provider");
            _resposne = { message: "couldn't get the provider", data: "", status: false };
            return _resposne;
        }
    }
    catch (error) {
        //console.log(error, "Unknown Error while Sending Tokens");
        _resposne = { message: "Unknown Error while Sending Tokens", data: "", status: false };
        return _resposne;
    }
    return _resposne;
});
exports.sendEVMNativeTokens = sendEVMNativeTokens;
function sendNativeTronMain(_fromPrivateKey, _amount, _receiverAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = { data: "", status: false, message: "" };
        const HttpProvider = TronWeb.providers.HttpProvider;
        const mainNetFullNode = new HttpProvider("https://api.trongrid.io");
        const mainNetSolidityNode = new HttpProvider("https://api.trongrid.io");
        const mainNetEventServer = new HttpProvider("https://api.trongrid.io");
        const tronWeb = new TronWeb((mainNetFullNode), (mainNetSolidityNode), (mainNetEventServer), _fromPrivateKey);
        const SUN = 1000000;
        tronWeb.trx.sendTransaction(_receiverAddress, _amount * SUN, _fromPrivateKey).then((res) => {
            response = { data: res, message: "Token Sent Successfully", status: false };
        }).catch((err) => {
            response = { data: err, message: "Something Went Wrong while sending Tron Tokens", status: true };
        });
        return response;
    });
}
exports.sendNativeTronMain = sendNativeTronMain;
// Tron for Nile network
function sendNativeTronTest(_fromPrivateKey, _amount, _receiverAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = { data: "", status: false, message: "" };
        try {
            const HttpProvider = TronWeb.providers.HttpProvider;
            const testNetFullNode = new HttpProvider("https://api.nileex.io");
            const testNetSolidityNode = new HttpProvider("https://api.nileex.io");
            const testNetEventServer = new HttpProvider("https://api.nileex.io");
            const tronWeb = new TronWeb((testNetFullNode), (testNetSolidityNode), (testNetEventServer), _fromPrivateKey);
            const SUN = 1000000;
            const res = yield tronWeb.trx.sendTransaction(_receiverAddress, _amount * SUN, _fromPrivateKey);
            response = { data: yield res, message: "Token Sent Successfully", status: false };
            return response;
        }
        catch (err) {
            response = { data: yield err, message: "Something Went Wrong while sending Tron Tokens", status: true };
            return response;
        }
    });
}
exports.sendNativeTronTest = sendNativeTronTest;
// send Mainnet/Testnet Bitcoin
const transferBitcoin = (privateKey, value, receiver, env, address, ecc) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, bitCoinHelper_1.transferBTC)(privateKey, value, receiver, env, address, ecc);
});
exports.transferBitcoin = transferBitcoin;
function getEthereumGasPrice(_chainId, _privateKey, _toAddress, _amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const _provider = yield (0, chainHelpers_1.setProvider)(_chainId);
            const gasPrice = yield _provider.getGasPrice();
            const convertedPrice = utils.formatUnits(gasPrice, "gwei");
            const wallet = new ethers.Wallet((_privateKey).toString());
            const walletSigner = wallet.connect(_provider);
            const estimatedGas = yield walletSigner.estimateGas({
                to: _toAddress.toString(),
                value: _amount.toString(),
            });
            const gasFees = estimatedGas.mul(gasPrice);
            const gasFeesInEther = ethers.utils.formatEther(gasFees);
            //console.log({ gasPrice: convertedPrice, gasFees: gasFees, gasFeesInEther: gasFeesInEther });
            return { data: { gasPrice: convertedPrice, gasFees: gasFees, gasFeesInEther: gasFeesInEther }, message: "", status: true };
        }
        catch (e) {
            return { data: e, message: "couldn't get gas fees", status: false };
        }
    });
}
exports.getEthereumGasPrice = getEthereumGasPrice;
const getTronResourceConsumption = (_sender, _to, _amount) => __awaiter(void 0, void 0, void 0, function* () {
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
        //console.log("Bandwidth:", bandwidth);
        //console.log("SUN required:", sunRequired);
        //console.log("TRX required:", trxRequired);
        return { data: { bandwidth, sunRequired, }, message: "gasFees Fetched..!", status: true };
    }
    catch (e) {
        return {
            data: e,
            message: "Couldn't fetch gasFees",
            status: false,
        };
    }
});
exports.getTronResourceConsumption = getTronResourceConsumption;
const getEstimatedFeesBitcoinTest = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://api.tatum.io/v3/blockchain/fee/BTC`,
            headers: {
                'x-api-key': (_a = (process.env.TATUM_API_KEY_TEST)) === null || _a === void 0 ? void 0 : _a.toString()
            }
        };
        const data = yield axios_1.default.request(config);
        const gasefees = {
            Fast: (data.data.fast * 0.00000001) * 256,
            Medium: (data.data.medium * 0.00000001) * 256,
            Slow: (data.data.slow * 0.00000001) * 256
        };
        return { data: gasefees, message: "gasFees Fetched..!", status: true };
    }
    catch (e) {
        return { data: e, message: "Couldn't fetch gasFees", status: false };
    }
});
exports.getEstimatedFeesBitcoinTest = getEstimatedFeesBitcoinTest;
const getEstimatedFeesBitcoinMain = () => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://api.tatum.io/v3/blockchain/fee/BTC`,
            headers: {
                'x-api-key': (_b = (process.env.TATUM_API_KEY_MAIN)) === null || _b === void 0 ? void 0 : _b.toString()
            }
        };
        const data = yield axios_1.default.request(config);
        const gasefees = {
            Fast: (data.data.fast * 0.00000001) * 256,
            Medium: (data.data.medium * 0.00000001) * 256,
            Slow: (data.data.slow * 0.00000001) * 256
        };
        return { data: data, message: "gasFees Fetched..!", status: true };
    }
    catch (e) {
        return { data: e, message: "Couldn't fetch gasFees", status: false };
    }
});
exports.getEstimatedFeesBitcoinMain = getEstimatedFeesBitcoinMain;
const getNetworkHex = () => {
};
exports.getNetworkHex = getNetworkHex;
// fetch Transactions for EVM chains(Tesnet-Mainnet)
const getTransactionsForEVM = (_network, _account) => __awaiter(void 0, void 0, void 0, function* () {
    let response = { data: null, message: "", status: false };
    try {
        const _response = yield moralis_1.default.EvmApi.transaction.getWalletTransactions({
            chain: (_network === 1 ? chainHelpers_1.chainHexObj["eth"] : _network === 2 ? chainHelpers_1.chainHexObj["bsc"] :
                _network === 3 ? chainHelpers_1.chainHexObj["polygon"] : _network === 6 ?
                    chainHelpers_1.chainHexObj["sepolia"] : _network === 7 ? chainHelpers_1.chainHexObj["bsc_testnet"] : chainHelpers_1.chainHexObj["mumbai"]).toString(),
            address: _account.toString(),
        });
        response = { data: _response, message: "transactions fetched!", status: true };
        return response;
    }
    catch (e) {
        //console.log("Error while Fetching bitcoin Transactions");
        return e;
    }
});
exports.getTransactionsForEVM = getTransactionsForEVM;
// _chain should be from => ethereum ,tron, polygon, bitcoin for Main-net
const getTransactionsFromTatumMain = (_chain, _address) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
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
        return { data: null, message: "Wrong Network Selected", status: false };
    }
    let response = { data: null, message: "", status: false };
    try {
        let config = {
            method: "get",
            maxBodyLength: Infinity,
            url: url,
            headers: {
                "x-api-key": (_c = (process.env.TATUM_API_KEY_MAIN)) === null || _c === void 0 ? void 0 : _c.toString(),
            },
        };
        yield axios_1.default.request(config).then((axiosResponse) => {
            // //console.log(JSON.stringify(axiosResponse.data), "data"); 
            response = { data: JSON.stringify(axiosResponse.data), message: "Transaction fetched..!", status: true };
            return response;
        }).catch((error) => {
            //console.log(error);
            response = { data: error, message: "Unexpected Error while getting Tron Trnmsactions", status: false };
            return response;
        });
    }
    catch (e) {
        //console.log("Error while fetching Transactions from TATUM", e);
        response = { data: e, message: "Unexpected Error while getting Tron Trnmsactions", status: false };
        return response;
    }
    return response;
});
exports.getTransactionsFromTatumMain = getTransactionsFromTatumMain;
// _chain should be from => ethereum ,tron, polygon, bitcoin
const getTransactionsFromTatumTest = (_chain, _address) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
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
                "x-api-key": (_d = (process.env.TATUM_API_KEY_TEST)) === null || _d === void 0 ? void 0 : _d.toString(),
            },
        };
        axios_1.default
            .request(config)
            .then((axiosResponse) => {
            //console.log(JSON.stringify(axiosResponse.data), "data");
            response = JSON.stringify(axiosResponse.data);
        })
            .catch((error) => {
            //console.log(error);
            response = error;
        });
        return response;
    }
    catch (e) {
        //console.log("Error while fetching Transactions from TATUM", e);
        response = e;
        return response;
    }
});
exports.getTransactionsFromTatumTest = getTransactionsFromTatumTest;
exports.networkId = {
    ethereum: 1,
    binance: 2,
    polygon: 3,
    tron: 4,
    bitcoin: 5,
    sepolia: 6,
    binance_test: 7,
    mumbai: 8,
    tron_test: 9,
    bitcoin_test: 10
};
