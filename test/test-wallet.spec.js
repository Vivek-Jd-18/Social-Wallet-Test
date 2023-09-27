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
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const test_1 = require("../src/wallet-functions/test");
// describe("Test createWallet()", async () => {
//     it("should return all ethereum, binance and polygon, tron and bitcoin wallets for testnet networks", async () => {
//         const result = await createWallet("testnet");
//         assert.notEqual(typeof result, null, "should return a wallet");
//     });
//     it("should return phrase", async () => {
//         const result = await createWallet("testnet");
//         assert.notEqual((result?.phrase).length, 0, "should return a phrase");
//     });
//     it("should return an address for bitcoin", async () => {
//         const result = await createWallet("testnet");
//         assert.notEqual((result?.bitcoinWallet.address).length, 0, "should return an address for bitcoin");
//     });
//     it("should return an address for ethereum", async () => {
//         const result = await createWallet("testnet");
//         assert.notEqual((result?.etherwallet.EthereumAddress).length, 0, "should return an address for ethereum");
//     })
//     it("should return an address for tron", async () => {
//         const result = await createWallet("testnet");
//         assert.notEqual((result?.tronwallet.TronAddress).length, 0, "should return an address for tron");
//     })
//     it("should return bitcoin public key", async () => {
//         const result = await createWallet("testnet");
//         assert.notEqual((result?.bitcoinWallet.BitcoinPublicKey).length, 0, "should return bitcoin public key");
//     })
//     it("should return ethereum public key", async () => {
//         const result = await createWallet("testnet");
//         assert.notEqual((result?.etherwallet.EthereumWalletPublicKeyHex).length, 0, "should return ethereum public key");
//     })
//     it("should return tron public key", async () => {
//         const result = await createWallet("testnet");
//         assert.notEqual((result?.tronwallet.TronWalletPublicKey).length, 0, "should return tron public key");
//     })
//     it("should return bitcoin private key", async () => {
//         const result = await createWallet("testnet");
//         assert.notEqual((result?.bitcoinWallet.BitcoinPrivateKey).length, 0, "should return bitcoin private key");
//     })
//     it("should return ethereum private key", async () => {
//         const result = await createWallet("testnet");
//         assert.notEqual((result?.etherwallet.EthereumWalletPrivateKeyHex).length, 0, "should return ethereum private key");
//     })
//     it("should return tron private key", async () => {
//         const result = await createWallet("testnet");
//         assert.notEqual((result?.tronwallet.TronWalletPrivateKey).length, 0, "should return tron private key");
//     })
// });
describe("Test importAnyAccountFromPrivateKey()", () => __awaiter(void 0, void 0, void 0, function* () {
    const bitcoinTestPrivateKey = "cT9yzavk66CqZ4avLfmEZJSb8AFdQNiAPUnneLzRzFyzgCeMJGW3";
    const ethereumTestPrivateKey = "0x488b4c368013bbb3feb381d2795a316bd1d2d153d49d150596bded29de46d202";
    const tronTestPrivateKey = "da0b60b6bacd85f9de3a26b142f445914c249040f2254993e71fb69862a2db08";
    const btcTestResult = yield (0, test_1.importAnyAccountFromPrivateKey)(10, bitcoinTestPrivateKey);
    it("should return first account of bitcoin testnet network", () => __awaiter(void 0, void 0, void 0, function* () {
        chai_1.assert.notEqual(btcTestResult === null || btcTestResult === void 0 ? void 0 : btcTestResult.publicAddress.length, 0, "should return the public address of bitcoin testnet network");
    }));
    const ethTestResult = yield (0, test_1.importAnyAccountFromPrivateKey)(1, ethereumTestPrivateKey);
    it("should return first account of ethereum testnet network", () => __awaiter(void 0, void 0, void 0, function* () {
        chai_1.assert.notEqual(ethTestResult === null || ethTestResult === void 0 ? void 0 : ethTestResult.publicAddress.length, 0, "should return the public address of ethereum testnet network");
    }));
    const tronTestResult = yield (0, test_1.importAnyAccountFromPrivateKey)(4, tronTestPrivateKey);
    it("should return first account of tron testnet network", () => __awaiter(void 0, void 0, void 0, function* () {
        chai_1.assert.notEqual(tronTestResult === null || tronTestResult === void 0 ? void 0 : tronTestResult.publicAddress.length, 0, "should return the public address of tron testnet network");
    }));
}));
