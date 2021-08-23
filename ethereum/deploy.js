const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider')

const provider = new HDWalletProvider('girl among inflict taste gap mistake advice still give slide sign stem', 'https://rinkeby.infura.io/v3/6c4896d42d2a4ec692e99d7d04acc8aa');
const web3 = new Web3(provider)
const compiledFactory = require('./build/CampaignFactory.json');
const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
  
    console.log('Attempting to deploy from account', accounts[0]);
  
    const result = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
      .deploy({ data: compiledFactory.bytecode })
      .send({ gas: '1000000', from: accounts[0] });
  
    console.log('Contract deployed to', result.options.address);
  };
  deploy();
  