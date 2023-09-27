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
describe("wallet Test", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(yield (0, test_1.createWallet)("testnet"), "test wallet");
    it("should return all ethereum, binance and polygon, tron and bitcoin wallets for testnet networks", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, test_1.createWallet)("testnet");
        chai_1.assert.notEqual(typeof result, null, "should return a wallet");
    }));
    it("should return phrase", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, test_1.createWallet)("testnet");
        chai_1.assert.notEqual((result === null || result === void 0 ? void 0 : result.phrase).length, 0, "should return a phrase");
    }));
    it("should return an address for bitcoin", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, test_1.createWallet)("testnet");
        chai_1.assert.notEqual((result === null || result === void 0 ? void 0 : result.bitcoinWallet.address).length, 0, "should return an address for bitcoin");
    }));
    it("should return an address for ethereum", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, test_1.createWallet)("testnet");
        chai_1.assert.notEqual((result === null || result === void 0 ? void 0 : result.etherwallet.EthereumAddress).length, 0, "should return an address for ethereum");
    }));
    it("should return an address for tron", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, test_1.createWallet)("testnet");
        chai_1.assert.notEqual((result === null || result === void 0 ? void 0 : result.tronwallet.TronAddress).length, 0, "should return an address for tron");
    }));
    it("should return bitcoin public key", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, test_1.createWallet)("testnet");
        chai_1.assert.notEqual((result === null || result === void 0 ? void 0 : result.bitcoinWallet.BitcoinPublicKey).length, 0, "should return bitcoin public key");
    }));
    it("should return ethereum public key", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, test_1.createWallet)("testnet");
        chai_1.assert.notEqual((result === null || result === void 0 ? void 0 : result.etherwallet.EthereumWalletPublicKeyHex).length, 0, "should return ethereum public key");
    }));
    it("should return tron public key", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, test_1.createWallet)("testnet");
        chai_1.assert.notEqual((result === null || result === void 0 ? void 0 : result.tronwallet.TronWalletPublicKey).length, 0, "should return tron public key");
    }));
}));
