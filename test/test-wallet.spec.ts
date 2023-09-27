import { assert } from "chai";
import { createWallet, importAnyAccountFromPrivateKey } from "../src/wallet-functions/test";

describe("Test createWallet()", async () => {

    it("should return all ethereum, binance and polygon, tron and bitcoin wallets for testnet networks", async () => {
        const result = await createWallet("testnet");
        assert.notEqual(typeof result, null, "should return a wallet");
    });

    it("should return phrase", async () => {
        const result = await createWallet("testnet");
        assert.notEqual((result?.phrase).length, 0, "should return a phrase");
    });

    it("should return an address for bitcoin", async () => {
        const result = await createWallet("testnet");
        assert.notEqual((result?.bitcoinWallet.address).length, 0, "should return an address for bitcoin");
    });

    it("should return an address for ethereum", async () => {
        const result = await createWallet("testnet");
        assert.notEqual((result?.etherwallet.EthereumAddress).length, 0, "should return an address for ethereum");
    })

    it("should return an address for tron", async () => {
        const result = await createWallet("testnet");
        assert.notEqual((result?.tronwallet.TronAddress).length, 0, "should return an address for tron");
    })

    it("should return bitcoin public key", async () => {
        const result = await createWallet("testnet");
        assert.notEqual((result?.bitcoinWallet.BitcoinPublicKey).length, 0, "should return bitcoin public key");
    })

    it("should return ethereum public key", async () => {
        const result = await createWallet("testnet");
        assert.notEqual((result?.etherwallet.EthereumWalletPublicKeyHex).length, 0, "should return ethereum public key");
    })

    it("should return tron public key", async () => {
        const result = await createWallet("testnet");
        assert.notEqual((result?.tronwallet.TronWalletPublicKey).length, 0, "should return tron public key");
    })

    it("should return bitcoin private key", async () => {
        const result = await createWallet("testnet");
        assert.notEqual((result?.bitcoinWallet.BitcoinPrivateKey).length, 0, "should return bitcoin private key");
    })

    it("should return ethereum private key", async () => {
        const result = await createWallet("testnet");
        assert.notEqual((result?.etherwallet.EthereumWalletPrivateKeyHex).length, 0, "should return ethereum private key");
    })

    it("should return tron private key", async () => {
        const result = await createWallet("testnet");
        assert.notEqual((result?.tronwallet.TronWalletPrivateKey).length, 0, "should return tron private key");
    })

});

describe("Test importAnyAccountFromPrivateKey()", async () => {

    const bitcoinTestPrivateKey = "cT9yzavk66CqZ4avLfmEZJSb8AFdQNiAPUnneLzRzFyzgCeMJGW3";
    const ethereumTestPrivateKey = "0x488b4c368013bbb3feb381d2795a316bd1d2d153d49d150596bded29de46d202";
    const tronTestPrivateKey = "da0b60b6bacd85f9de3a26b142f445914c249040f2254993e71fb69862a2db08";

    const btcTestResult: any = await importAnyAccountFromPrivateKey(10, bitcoinTestPrivateKey);
    it("should return first account of bitcoin testnet network", async () => {
        assert.notEqual(btcTestResult?.publicAddress.length, 0, "should return the public address of bitcoin testnet network");
    });

    const ethTestResult: any = await importAnyAccountFromPrivateKey(1, ethereumTestPrivateKey);
    it("should return first account of ethereum testnet network", async () => {
        assert.notEqual(ethTestResult?.publicAddress.length, 0, "should return the public address of ethereum testnet network");
    })

    const tronTestResult: any = await importAnyAccountFromPrivateKey(4, tronTestPrivateKey);
    it("should return first account of tron testnet network", async () => {
        assert.notEqual(tronTestResult?.publicAddress.length, 0, "should return the public address of tron testnet network");
    })

});
