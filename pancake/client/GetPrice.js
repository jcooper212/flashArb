const ethers = require("ethers");
const {addressFactory, addressRouter, addressFrom, addressTo} = require("./AddressList");
const ibep20Interface  = require('./abi/ibep20.json');
const PancakeFactoryInterface  = require('./abi/PancakeFactory.json');
const PancakeRouterInterface  = require('./abi/PancakeRouter.json');

const provider = new ethers.providers.JsonRpcProvider(
    "https://bsc-dataseed.binance.org");

//console.log(provider);

//connect to factory
const contractFactory = new ethers.Contract(
    addressFactory,
    PancakeFactoryInterface.abi,
    provider
);
//console.log(contractFactory);

//connect to router
const routerFactory = new ethers.Contract(
    addressRouter,
    PancakeRouterInterface.abi,
    provider
);
//console.log(routerFactory);

//connect to ibep
const toTokenFactory = new ethers.Contract(
    addressTo,
    ibep20Interface.abi,
    provider
);
//console.log(routerFactory);

//Call the contract functions
const getPrices = async (_amount) => {
    const fromToken = new ethers.Contract(addressFrom, ibep20Interface.abi, provider);
    const decimals = await fromToken.decimals();
    const _amountIn = ethers.utils.parseUnits(_amount, decimals).toString();
    //console.log(`From token value is ${_amountStr} has ${decimals} decimals`);

    //get amount out
    const _amountOut = await routerFactory.getAmountsOut(_amountIn,
        [addressFrom, addressTo]);
    const str = String(_amountOut[1]);
    //convert amount out
    const decimalTo = await toTokenFactory.decimals();
    const _amountOutStr = ethers.utils.formatUnits(
        _amountOut[1].toString(),decimalTo);
        //_amountOut[1].toString(),decimalTo);
    
    console.log(`From token value is ${_amountIn} has ${decimals} decimals`);
    console.log(`To token value is ${_amountOutStr} has ${decimals} decimals`);

}

const num = '300';
getPrices(num);
