const ethers = require("ethers");
const { Pool } = require ('@uniswap/v3-sdk');
const { Token } = require ('@uniswap/sdk-core');
const {addressFactory, addressRouter, uniswapFactory, addressWETH, addressUSDC, addressSUSHI} = require("./AddressList");
const { abi:  IUniswapV3PoolABI } = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json');
const  { abi: QuoterABI } = require('@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json');
const UniswapFactoryInterface  = require('./abi/UniswapFactory.json');


const provider = new ethers.providers.JsonRpcProvider(
    "https://eth-mainnet.g.alchemy.com/v2/txWoTmJ79Q4ZTziVQ3arn-ApJcRrTBKB");

//const factoryAddress = '0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8'

const contractFactory = new ethers.Contract(uniswapFactory, UniswapFactoryInterface.abi, provider);

const getPool = async () => {
    const owner = await contractFactory.owner();
    console.log(`getPool ${addressWETH} ${addressSUSHI} and owner ${owner}`);
    const addressPool = await contractFactory.getPool(
        addressWETH,
        addressSUSHI,
        3000
    );
    console.log(`getPool ${addressWETH} ${addressSUSHI} is => ${addressPool}`);
}

getPool();
