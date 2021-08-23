const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface)).deploy({ data: compiledFactory.bytecode }).send({ from: accounts[0], gas: '1000000'});

    await factory.methods.createCampaign('100').send({ from: accounts[0], gas: '1000000' });

    [campaignAddress] = await factory.methods.getDeployedCampaign().call();
    campaign = await new web3.eth.Contract(JSON.parse(compiledCampaign.interface), campaignAddress);
});

describe('Campaign', () => {
    it('deploy a factory and a compaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    it('caller as the campaign manager', async () => {
        const manager = await campaign.methods.manager().call();
        assert.equal(accounts[0], manager);
    });

    it('allow people to contribute money and mark them as approvers', async () => {
        await campaign.methods.contribute().send({
            value: '200',
            from: accounts[1]
        });
        const isContributor = await campaign.methods.approvers(accounts[1]);
        assert(isContributor);
    });

    it('requires a minimum contribution', async () => {
        try {
            await campaign.methods.contribute().send({
                value: '80',
                address: accounts[2]
            });
            assert(false)
        } catch (error) {
            assert(error)
        }
    });

    it('allow a manager to create campaign request', async () => {
        await campaign.methods.createRequest('Buy Bullet', web3.utils.toWei('2', 'ether'), accounts[1]).send({
            from: accounts[0],
            gas: '1000000'
        });
        const camRequest = await campaign.methods.request(0).call();
        assert.equal('Buy Bullet', camRequest.description);
    });

    it('process request', async () => {
        await campaign.methods.contribute().send({
            from: accounts[1],
            value: web3.utils.toWei('1', 'ether')
        });

        await campaign.methods.createRequest('Buy Fish', web3.utils.toWei('1', 'ether'), accounts[1]).send({
            from: accounts[0],
            gas: '1000000'
        });

        await campaign.methods.approveRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        });

        await campaign.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        });

        let balance = await web3.eth.getBalance(accounts[1]);
        balance = web3.utils.fromWei(balance, 'ether');
        balance = parseFloat(balance);

        assert(balance > 104)
    })
})