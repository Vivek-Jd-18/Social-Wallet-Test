import Moralis from "moralis";

// need to call this function when server starts 
export const startMoralis = async () => {
  await Moralis.start({
    apiKey: (process.env.MORALIS_API_KEY as string).toString(),
  });
};