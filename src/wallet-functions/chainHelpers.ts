// import * as ecc from 'tiny-secp256k1';
import ECPairFactory from "ecpair";
import * as bitcoin from "bitcoinjs-lib";
import ecfacory from "ecpair";
import axios from "axios";
import { ethers } from "ethers";
import Moralis from "moralis";
import TinySecp256k1Interface from "ecpair";
// TinySecp256k1Interface

const createBTCTx = async (
    toAddress: any,
    value: number,
    env: string,
    fromAddress: any
) => {
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
        } else if (env == "mainnet") {
            url = "https://api.blockcypher.com/v1/btc/main/txs/new";
        } else {
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
        const response = await axios({
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
    } catch (error) {
        console.log("error generating btc tx", error);
        return {
            code: 0,
            message: error,
        };
    }
};
const generateSignatures = (
    privateKey: any,
    env: string,
    toSign: string | any[],
    ecc: any
) => {
    try {
        const ECPair = ECPairFactory(ecc);
        // console.log(ECPair);
        let keys;
        if (env == "testnet") {
            keys = ECPair.fromWIF(privateKey, bitcoin.networks.testnet);
            //   console.log(keys);
        } else if (env == "mainnet") {
            keys = ECPair.fromWIF(privateKey, bitcoin.networks.bitcoin);
            //   console.log(keys);
        } else {
            return {
                code: 0,
                error: "Invalid ENV",
            };
        }
        const signatures: any = [];
        const pubkeys: any = [];
        for (let i = 0; i < toSign.length; i++) {
            // console.log(i,"Data");
            signatures.push(
                bitcoin.script.signature
                    .encode(keys.sign(Buffer.from(toSign[i], "hex")), 0x01)
                    .toString("hex")
                    .slice(0, -2)
            );
            pubkeys.push(keys.publicKey.toString("hex"));
        }
        // console.log("Signature", signatures, "Pubkeys", pubkeys);
        return {
            code: 1,
            signatures,
            pubkeys,
        };
    } catch (error /* : any */) {
        return {
            code: 0,
            error,
        };
    }
};

const sendBTCTx = async (
    tx: any,
    toSign: any,
    signatures: any,
    pubkeys: any,
    env: string
) => {
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
        } else if (env == "mainnet") {
            url = "https://api.blockcypher.com/v1/btc/main/txs/send";
        } else {
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
        const response = await axios({
            url,
            method: "post",
            data: sendTx,
        });
        // console.log(response, "Response...");
        if (response.status != 201) {
            return {
                code: 0,
                message: response?.data,
            };
        }
        // console.log(response.data);
        return {
            code: 1,
            result: response.data,
        };
    } catch (error) {
        console.log("error sending btc txs", error);
        return {
            code: 0,
            error,
        };
    }
};

export const transferBTC = async (
    privateKey: string,
    value: number,
    receiver: string,
    env: string,
    address: string,
    ecc: any
) => {
    try {
        const createTxResponse = await createBTCTx(receiver, value, env, address);
        // console.log(createTxResponse, "createTxResponsecreateTxResponse");
        if (createTxResponse?.code != 1) return createTxResponse;
        const tx = createTxResponse.result.tx;
        const toSign = createTxResponse.result.tosign;
        // console.log(tx, toSign);
        const generateSignaturesResponse = generateSignatures(
            privateKey,
            env,
            toSign,
            ecc
        );
        if (generateSignaturesResponse?.code != 1)
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
        const sendBTCTxResponse = await sendBTCTx(
            tx,
            toSign,
            signatures,
            pubkeys,
            env
        );
        if (sendBTCTxResponse?.code != 1) return sendBTCTxResponse;
        // console.log("Message", tx,
        //     toSign,
        //     signatures,
        //     pubkeys,);
        console.log(sendBTCTxResponse.result);
        const returnValue = sendBTCTxResponse.result;
        return {
            returnValue,
        };
    } catch (error) {
        return {
            code: 0,
            error,
        };
    }
};

export type TronAccType = {
    privateKey: string;
    address: string;
};
export type sendTokenResponseType = {
    message: string;
    data: any;
    error: boolean;
};
const getWorkingUrl = async (chainId: number) => {
    const workingURL: any = {
        totatURLs: 0,
        urls: [],
    };
    const urls = await getRPCFromMoralis(chainId);
    const substringToRemove = "${INFURA_API_KEY}";
    const working = await Promise.all(
        urls.map(async (i) => {
            const newString = i.replace(substringToRemove, "");
            try {
                const response = await axios.get(newString);
                if (response.status === 200) {
                    if (newString !== "" && newString !== undefined) {
                        // console.log("Working", newString);
                        return newString;
                    }
                } else {
                    return "";
                }
            } catch {
                return "";
            }
        })
    );
    await working.map((i) => {
        if (i !== "") {
            workingURL.totatURLs += 1;
            workingURL.urls.push(i);
        }
    });
    return workingURL;
};

const getRPCFromMoralis = async (chainId: number) => {
    let rpcURL: string[] = [];
    if (chainId === 1) {
        const ethereumNet = Moralis.EvmUtils.EvmChain.ETHEREUM.rpcUrls;
        // console.log(ethereumNet, "ETHEREUM urls");
        rpcURL = ethereumNet as string[];
    } else if (chainId === 2) {
        const bscMainNet = Moralis.EvmUtils.EvmChain.BSC.rpcUrls;
        // console.log(bscMainNet, "BSC-MAIN urls");
        rpcURL = bscMainNet as string[];
    } else if (chainId === 3) {
        const polygonNet = Moralis.EvmUtils.EvmChain.POLYGON.rpcUrls;
        // console.log(polygonNet, "POLYGON urls");
        rpcURL = polygonNet as string[];
    } else if (chainId === 6) {
        const goerliNet = Moralis.EvmUtils.EvmChain.SEPOLIA.rpcUrls;
        // console.log(goerliNet, "SEPOLIA urls");
        rpcURL = goerliNet as string[];
    } else if (chainId === 7) {
        const sepoliaNet = Moralis.EvmUtils.EvmChain.BSC_TESTNET.rpcUrls;
        // console.log(sepoliaNet, "BSC_TESTNET urls");
        rpcURL = sepoliaNet as string[];
    } else if (chainId === 8) {
        const bscTestNet = Moralis.EvmUtils.EvmChain.MUMBAI.rpcUrls;
        // console.log(bscTestNet, "MUMBAI urls");
        rpcURL = bscTestNet as string[];
    } else {
        rpcURL = [];
    }
    return rpcURL;
};

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

export const chainHexObj =
{
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

export const AllChainId = [
    {
        id: 0,
        name: "Goerli test network",
        chainId: "5",
        currencySymbol: "GoerliETH",
        rpcURL:
            "https://eth-goerli.g.alchemy.com/v2/veOOFscjUfWy5-F9idsh8ul-UBvIt3lX",
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
        rpcURL:
            "https://bsc.getblock.io/acfb8004-9fb8-42c5-a5b2-da8000aaecfa/mainnet/",
        explorerURL: "https://bscscan.com/",
    },
    {
        id: 3,
        name: "Polygon Mainnet",
        chainId: "137",
        currencySymbol: "MATIC",
        rpcURL:
            "https://polygon-mainnet.g.alchemy.com/v2/Ra7cEGxd4SofbeedjRLWOtw-c7_4KkVP",
        explorerURL: "https://polygonscan.com/",
    },
    {
        id: 6,
        name: "Sepolia test network",
        chainId: "11155111",
        currencySymbol: "SepoliaETH",
        rpcURL:
            "https://eth-sepolia.g.alchemy.com/v2/R6OILRKTXDUEBz3gObRmArSbNIieviHL",
        explorerURL: "https://sepolia.etherscan.io",
    },
    {
        id: 7,
        name: "Smart Chain - Testnet",
        chainId: "97",
        currencySymbol: "BNB",
        rpcURL:
            "https://bsc.getblock.io/acfb8004-9fb8-42c5-a5b2-da8000aaecfa/testnet/",
        explorerURL: "https://testnet.bscscan.com",
    },
    {
        id: 8,
        name: "Mumbai Testnet",
        chainId: "80001",
        currencySymbol: "MATIC",
        rpcURL:
            'https://rpc-mumbai.maticvigil.com',
        // "https://polygon-mumbai.g.alchemy.com/v2/5y_OoMtv4xEChYXvTbqEr2BebPozufTv",
        explorerURL: "https://mumbai.polygonscan.com/",
    },
];

export const setProvider = async (chainId: any) => {
    const urlData = await getWorkingUrl(chainId);
    // console.log("workingRPC", urlData, "workingRPC");
    let provider: any;
    let blockNumber: string | number = 0;
    try {
        if (Number(chainId) == 1) {
            provider = new ethers.providers.JsonRpcProvider(AllChainId[1].rpcURL);
            blockNumber = await provider.getBlockNumber();
            // console.log("for ETHEREUM MAIN Network");
        } else if (Number(chainId) == 2) {
            provider = new ethers.providers.JsonRpcProvider(AllChainId[2].rpcURL);
            blockNumber = await provider.getBlockNumber();
            // console.log("for BNB MAIN Network");
        } else if (Number(chainId) == 3) {
            provider = new ethers.providers.JsonRpcProvider(AllChainId[3].rpcURL);
            blockNumber = await provider.getBlockNumber();
            // console.log("for POLYGON MAIN Network");
        } else if (Number(chainId) == 6) {
            provider = new ethers.providers.JsonRpcProvider(AllChainId[4].rpcURL);
            blockNumber = await provider.getBlockNumber();
            // console.log("for SEPOLIA Network");
        } else if (Number(chainId) == 7) {
            provider = new ethers.providers.JsonRpcProvider(AllChainId[5].rpcURL);
            blockNumber = await provider.getBlockNumber();
            // console.log("for BNB TEST Network");
        } else if (Number(chainId) == 8) {
            provider = new ethers.providers.JsonRpcProvider(AllChainId[6].rpcURL);
            // blockNumber = await provider.getBlockNumber();
            // console.log("for MUMBAI TEST Network");
        } else {
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
    } catch (e: any) {
        console.log(e, "Error while setting the Provider");
        return 0;
    }
    return provider;
};

export const getChain = async (chainId: any) => {
    let chain: any;
    try {
        if (Number(chainId) == 0) {
            chain = chainList[0];
            console.log(chain, "for ETH Network");
        } else if (Number(chainId) == 1) {
            chain = chainList[1];
            console.log(chain, "for BNB MAIN Network");
        } else if (Number(chainId) == 2) {
            chain = chainList[2];
            console.log(chain, "for GOERLI Network");
        } else if (Number(chainId) == 3) {
            chain = chainList[3];
            console.log(chain, "for SEPOLIA Network");
        } else if (Number(chainId) == 4) {
            chain = chainList[4];
            console.log(chain, "for BNB TEST Network");
        } else if (Number(chainId) == 5) {
            chain = chainList[5];
            console.log(chain, "for POLYGON MAIN Network");
        } else if (Number(chainId) == 6) {
            chain = chainList[6];
            console.log(chain, "for MUMBAI TEST Network");
        } else {
            console.log("Sent Wrong Network ID");
            return 0;
        }
    } catch (e: any) {
        console.log(e, "Error while getting the chain");
        return 0;
    }
    return chain;
};

// _chain should be from => ethereum ,tron, polygon, bitcoin
export const getTransactionsFromTatum = async (
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
                "x-api-key": process.env.TRON_MAINNET_API,
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

// fetch Transactions for Binance chain(Tesnet-Mainnet) (_isTestNet = true for testnet )
export const getTransactionsForBinance = async (
    _isTestNet: boolean,
    _account: string
) => {
    let response: any = "";
    let hex = "0x38";
    try {
        if (_isTestNet) {
            hex = "0x61";
        }
        response = await Moralis.EvmApi.transaction.getWalletTransactions({
            chain: hex.toString(),
            address: _account.toString(),
        });
        return response;
    } catch (e: any) {
        console.log("Error while Fetching bitcoin Transactions");
        return e;
    }
};
