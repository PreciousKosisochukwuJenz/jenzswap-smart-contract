const Token = artifacts.require('Token')
const JenzSwap = artifacts.require('JenzSwap')

module.exports = async function (deployer) {
  // Deploy token
  await deployer.deploy(Token)
  const token = await Token.deployed()

  // Deploy jenzswap
  await deployer.deploy(JenzSwap, token.address)
  const jenzswap = await JenzSwap.deployed()

  // Transfer all token to jenz swap (1 million)
  await token.transfer(jenzswap.address, '1000000000000000000000000')
}
