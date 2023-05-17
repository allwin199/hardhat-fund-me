
```markdown
# Hardhat Fund Me

This project is a basic version of a crowdfunding app.

## Quick Start

```shell
git clone project
cd project
yarn
```

## Usage

Deploy:

```shell
yarn hardhat deploy
```

### Testing

```shell
yarn hardhat test
```

#### Test Coverage

```shell
yarn hardhat coverage
```

## Deployment to a Testnet or Mainnet

1. Setup environment variables

   You'll want to set your `SEPOLIA_RPC_URL` and `PRIVATE_KEY` as environment variables. You can add them to a `.env` file, similar to what you see in `.env.example`.

   - `PRIVATE_KEY`: The private key of your account (like from [metamask](https://metamask.io/)). **NOTE:** FOR DEVELOPMENT, PLEASE USE A KEY THAT DOESN'T HAVE ANY REAL FUNDS ASSOCIATED WITH IT.
     - You can [learn how to export it here](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key).
   - `SEPOLIA_RPC_URL`: This is the URL of the seplia testnet node you're working with. You can get set up with one for free from [Alchemy](https://alchemy.com/?a=673c802981)

2. Get Testnet ETH

   Head over to [faucets.chain.link](https://faucets.chain.link/) and get some testnet ETH. You should see the ETH show up in your Metamask.

3. Deploy

   ```shell
   yarn hardhat deploy --network sepolia
   ```

## Scripts

After deploying to a testnet or local net, you can run the scripts:

```shell
yarn hardhat run scripts/fund.js
```

or

```shell
yarn hardhat run scripts/withdraw.js
```

## Estimate Gas

You can estimate how much gas things cost by running:

```shell
yarn hardhat test
```

You'll see an output file called `gas-report.txt`.

### Estimate Gas Cost in USD

To get a USD estimation of gas cost, you'll need a `COINMARKETCAP_API_KEY` environment variable. You can get one for free from [CoinMarketCap](https://pro.coinmarketcap.com/signup).

Then, uncomment the line `coinmarketcap: COINMARKETCAP_API_KEY,` in `hardhat.config.js` to get the USD estimation. Just note that every time you run your tests, it will use an API call, so it might make sense to have using CoinMarketCap disabled until you need it. You can disable it by commenting the line back out.

## Verify on Etherscan

If you deploy to a testnet or mainnet and have an [API Key](https://etherscan.io/myapikey) from Etherscan set as an environment variable named `ETHERSCAN_API_KEY`, you can verify the contracts. You can add it to your `.env` file as shown in the `.env.example`.

In its current state, if you have your API key set, it will auto-verify sepolia contracts.

# Technologies Used

1. Solidity
2. JavaScript

# Thank you!
```