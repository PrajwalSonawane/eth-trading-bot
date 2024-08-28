const { BtcWallet } = require('@okxweb3/coin-bitcoin');
const { message } = require('@okxweb3/coin-bitcoin');

const testCases = [
  {
    signerAddress: "1BuN9d4RrF8r7gquMkvGShGjUHzt4kybBg",
    messageText: "0xDB32D97cF205f222060904A7140a16feD0650BaB",
    signature: "IH4vWR//INfJ8rqyF2QbopViq+bYGzyhhZw26gwC0yR4P6RWvMV9iXOs5i+cwvvSfJRT8f+AtozaBekqXtyq+2M=",
    addressType: "Legacy"
  },
  {
    signerAddress: "bc1pma0z4kklknnuwgyzyzr7t9fx4c0xejalz7edazj7swk5lx7f33uql04uvt",
    messageText: "0x59Bb8F7AbfA44852D272E8eE0d3a202AA5AceABB",
    signature: "HwP0hxFTjMeRTvl/z/tqF7zwUNBjkA8P5vfL/gA5iVrrBBcWcMljX6ZeLrolLgZkxhYiueVCSkVH94novoLS83I=",
    addressType: "Taproot"
  },
  {
    signerAddress: "bc1qk7g9sfga8mx0jgljstg7wq5yfad2y3kk0agghr",
    messageText: "0x59Bb8F7AbfA44852D272E8eE0d3a202AA5AceABB",
    signature: "H4ygqnBWNSN9ic9v2uEZISUAAkc7JP6KiAvvK/7dIqt3NkCEgmH7Y3HbP/dzJN7KaFd6kuezmyWFzkpVRLo3Iss=",
    addressType: "Native segwit"
  },
  {
    signerAddress: "38MZ4vT3uB5sAhyrWbKdP2jeJhCYABjs1S",
    messageText: "0x59Bb8F7AbfA44852D272E8eE0d3a202AA5AceABB",
    signature: "H8bKJUY48foC3LvBU6+FIjGOsw6rDrCwYJ7rCgyLXVzFIsjmt/9dlfSQGFlTxugVAWdXZzx/bzfMN8bR8y/67l4=",
    addressType: "Nested segwit"
  }
]

async function check() {
  let wallet = new BtcWallet()
  testCases.forEach((testCase) => {
    try {
      const status = message.verifyWithAddress(testCase.signerAddress, testCase.messageText, testCase.signature);
      console.log(testCase.addressType, "Is signature verified: ", status);
    } catch (e) {
      console.log(testCase.addressType, "Is signature verified: ", false);
    }
  })
}

check();