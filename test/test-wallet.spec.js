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
const utils_1 = require("../src/wallet-functions/utils");
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
//         assert.notEqual((result?.bitcoinWallet.bitcoinAddress).length, 0, "should return an address for bitcoin");
//     });
//     it("should return an address for ethereum", async () => {
//         const result = await createWallet("testnet");
//         assert.notEqual((result?.ethereumWallet.ethereumAddress).length, 0, "should return an address for ethereum");
//     })
//     it("should return an address for tron", async () => {
//         const result = await createWallet("testnet");
//         assert.notEqual((result?.tronWallet.tronAddress).length, 0, "should return an address for tron");
//     })
//     it("should return bitcoin public key", async () => {
//         const result = await createWallet("testnet");
//         assert.notEqual((result?.bitcoinWallet.bitcoinPublicKey).length, 0, "should return bitcoin public key");
//     })
//     it("should return ethereum public key", async () => {
//         const result = await createWallet("testnet");
//         assert.notEqual((result?.ethereumWallet.ethereumPublicKey).length, 0, "should return ethereum public key");
//     })
//     it("should return tron public key", async () => {
//         const result = await createWallet("testnet");
//         assert.notEqual((result?.tronWallet.tronPublicKey).length, 0, "should return tron public key");
//     })
//     it("should return bitcoin private key", async () => {
//         const result = await createWallet("testnet");
//         assert.notEqual((result?.bitcoinWallet.bitcoinPrivateKey).length, 0, "should return bitcoin private key");
//     })
//     it("should return ethereum private key", async () => {
//         const result = await createWallet("testnet");
//         assert.notEqual((result?.ethereumWallet.ethereumPrivateKey).length, 0, "should return ethereum private key");
//     })
//     it("should return tron private key", async () => {
//         const result = await createWallet("testnet");
//         assert.notEqual((result?.tronWallet.tronPrivateKey).length, 0, "should return tron private key");
//     })
// });
// describe("Test importAnyAccountFromPrivateKey()", async () => {
//     const bitcoinTestPrivateKey = "cT9yzavk66CqZ4avLfmEZJSb8AFdQNiAPUnneLzRzFyzgCeMJGW3";
//     const ethereumTestPrivateKey = "0x488b4c368013bbb3feb381d2795a316bd1d2d153d49d150596bded29de46d202";
//     const tronTestPrivateKey = "da0b60b6bacd85f9de3a26b142f445914c249040f2254993e71fb69862a2db08";
//     const btcTestResult: any = await importAnyAccountFromPrivateKey(10, bitcoinTestPrivateKey);
//     it("should return first account of bitcoin testnet network", async () => {
//         assert.notEqual(btcTestResult?.publicAddress.length, 0, "should return the public address of bitcoin testnet network");
//     });
//     const ethTestResult: any = await importAnyAccountFromPrivateKey(6, ethereumTestPrivateKey);
//     it("should return first account of ethereum testnet network", async () => {
//         assert.notEqual(ethTestResult?.publicAddress.length, 0, "should return the public address of ethereum testnet network");
//     })
//     const tronTestResult: any = await importAnyAccountFromPrivateKey(9, tronTestPrivateKey);
//     it("should return first account of tron testnet network", async () => {
//         assert.notEqual(tronTestResult?.publicAddress.length, 0, "should return the public address of tron testnet network");
//     })
// });
// describe("Test importAccountFromPhrase()", async () => {
//     const secretPhrase = "charge lunar agree guitar scatter forest enough derive airport fine hip coffee";
//     const result: any = await importAccountFromPhrase(secretPhrase, "testnet");
//     it("should return an address for bitcoin", async () => {
//         assert.notEqual((result?.bitcoinWallet.bitcoinAddress).length, 0, "should return an address for bitcoin testnet network");
//     });
//     it("should return an address for ethereum", async () => {
//         assert.notEqual((result?.ethereumWallet.ethereumAddress).length, 0, "should return an address for ethereum testnet network");
//     })
//     it("should return an address for tron", async () => {
//         assert.notEqual((result?.tronWallet.tronAddress).length, 0, "should return an address for tron testnet network");
//     })
// })
// describe("Test importAccountFromPhraseAndIndex()", async () => {
//     const env = "testnet";
//     const phrase = "charge lunar agree guitar scatter forest enough derive airport fine hip coffee";
//     const index = 0;
//     const result:any = await importAccountFromPhraseAndIndex(phrase, index, env);
//     console.log(result)
//     it("should return first account of bitcoin testnet network", async () => {
//         assert.notEqual(result?.bitcoinWallet.bitcoinAddress , 0, "should return the public address of bitcoin testnet network");
//     })
//     it("should return first account of ethereum testnet network", async () => {
//         assert.notEqual(result?.ethereumWallet.ethereumAddress , 0, "should return the public address of ethereum testnet network");
//     })
//     it("should return first account of tron testnet network", async () => {
//         assert.notEqual(result?.tronWallet.tronAddress , 0, "should return the public address of tron testnet network");
//     })
// })
describe("Test getBalance()", () => __awaiter(void 0, void 0, void 0, function* () {
    const ethereumAddress = "0x1cb0a69aA6201230aAc01528044537d0F9D718F3";
    const binanceAddress = "0x1cb0a69aA6201230aAc01528044537d0F9D718F3";
    const mumbaiAddress = "0x1cb0a69aA6201230aAc01528044537d0F9D718F3";
    const tronAddress = "";
    const bitcoinAddress = "";
    const ethereumResult = yield (0, test_1.getBalance)(ethereumAddress, utils_1.networkId.sepolia);
    console.log(ethereumResult, "BALANCE");
    it("should return the balance of the sepolia(ethereum testnet) address for sepolia(ethereum testnet)", () => __awaiter(void 0, void 0, void 0, function* () {
        chai_1.assert.notEqual(ethereumResult, 0, "should return the balance of given address for sepolia(ethereum testnet)");
    }));
    // const binanceResult = await getBalance(binanceAddress,networkId.binance_test);
    // it("should return the balance of the binance testnet address for binance testnet network", async () => {
    //     assert.notEqual(binanceResult, 0, "should return the balance of given address for binance testnet network");        
    // })
    // const mumbaiResult = await getBalance(mumbaiAddress,networkId.mumbai);
    // it("should return the balance of the mumbai testnet address for mumbai testnet network", async () => {
    //     assert.notEqual(mumbaiResult, 0, "should return the balance of given address for mumbai testnet network");
    // })
    // const tronResult = await getBalance(tronAddress,networkId.tron_test);
    // it("should return the balance of the tron testnet address for tron testnet network", async () => {
    //     assert.notEqual(tronResult, 0, "should return the balance of given address for tron testnet network");
    // })
    // const bitcoinResult = await getBalance(bitcoinAddress,networkId.bitcoin_test);
    // it("should return the balance of the bitcoin testnet address for bitcoin testnet network", async () => {
    //     assert.notEqual(bitcoinResult, 0, "should return the balance of given address for bitcoin testnet network");
    // })
}));
