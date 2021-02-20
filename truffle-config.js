module.exports = {
  mocha:{
    enableTimeouts: false
  },
  contracts_directory:"./contracts",
  compilers:{
    solc:{
      version:"0.6.12",
      settings:{
        optimizer:{
          enabled:true,
          runs:3
        }
      }
    }
  },
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
      websockets:false
    },
    test: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
      websockets:false
    },
    testnet:{
      provider: function() {
          const HDWalletProvider = require("@truffle/hdwallet-provider");
          return new HDWalletProvider(
            {
                providerOrUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
                numberOfAddresses: 1,
                privateKeys:[
                  process.env.BSC_ADMIN_PRIVATE_KEY
                ]
            }
            ); 
      },
      network_id: "*",  // match any network
      websockets:true,
      networkCheckTimeout: 1000000000
    },
    mainnet: {
      provider: function () {
        const HDWalletProvider = require("@truffle/hdwallet-provider");
        return new HDWalletProvider(
          {
            providerOrUrl: "https://bsc-dataseed1.binance.org",
            numberOfAddresses: 1,
            privateKeys: [
              process.env.BSC_ADMIN_PRIVATE_KEY
            ]
          }
        );
      },
      network_id: "*",  // match any network
      websockets: true,
      networkCheckTimeout: 1000000000
    }
  }
};
