const ethers = require("ethers");
const { Pool } = require ('@uniswap/v3-sdk');
const { Token } = require ('@uniswap/sdk-core');
const {addressFactory, addressRouter, uniswapFactory, addressWETH, addressUSDC, addressSUSHI} = require("./AddressList");

const  { abi: QuoterABI } = require('@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json');

const provider = new ethers.providers.JsonRpcProvider(
    "https://eth-mainnet.g.alchemy.com/v2/txWoTmJ79Q4ZTziVQ3arn-ApJcRrTBKB");

async function getPrice(_amount){
    const quoteAddress = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6';

    const quoterContract = new ethers.Contract(
        quoteAddress,
        QuoterABI,
        provider
    );
    const _amountIn = ethers.utils.parseUnits(_amount,6);
    const _amountOut = await quoterContract.callStatic.quoteExactInputSingle(
        addressUSDC,
        addressWETH,
        3000,
        _amountIn.toString(),
        0
    );

    return ethers.utils.formatUnits(_amountOut.toString(),18);
}

const main = async() => {
    const amountOut = await getPrice("1290");
    console.log(`The amountOut is ${amountOut}`);
}

main();