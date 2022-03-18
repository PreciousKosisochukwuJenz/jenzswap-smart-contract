const Token = artifacts.require('Token')
const JenzSwap = artifacts.require('JenzSwap')

require('chai').use(require('chai-as-promised')).should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether')
}

contract('JenzSwap', ([deployer, invester]) => {
  let token, jenzswap
  before(async () => {
    token = await Token.new()
    jenzswap = await JenzSwap.new(token.address)

    await token.transfer(jenzswap.address, tokens('1000000'))
  })

  describe('Token', async () => {
    it('Contract has a name', async () => {
      const name = 'Jenz Token'
      const contractname = await token.name()
      assert.equal(contractname, name, "Doesn't match")
    })
  })

  describe('Jenz Swap', async () => {
    it('Contract has a name', async () => {
      const name = 'Jenz Swap Cryptocurrency Exchange'
      const contractname = await jenzswap.name()
      assert.equal(contractname, name, "Doesn't match")
    })

    it('Jenz Swap has all tokens', async () => {
      const balance = await token.balanceOf(jenzswap.address)
      const actualAmount = tokens('1000000')

      assert.equal(balance.toString(), actualAmount)
    })
  })

  describe('buyTokens()', async () => {
    let result
    before(async () => {
      result = await jenzswap.buyTokens({
        from: invester,
        value: web3.utils.toWei('1', 'ether'),
      })
    })

    it('Token was bought', async () => {
      // Check investor balance
      let investorBalance = await token.balanceOf(invester)

      assert.equal(investorBalance.toString(), tokens('100'))

      // Check jenzswap balance
      let jenzswapBalance = await token.balanceOf(jenzswap.address)

      assert.equal(jenzswapBalance.toString(), tokens('999900'))

      // Check if jenzSwap ether amount went up
      let jenzswapEtherBalance = await web3.eth.getBalance(jenzswap.address)

      assert.equal(jenzswapEtherBalance.toString(), tokens('1'))

      const event = result.logs[0].args
      assert.equal(event.account, invester)
      assert.equal(event.token, token.address)
      assert.equal(event.amount.toString(), tokens('100'))
      assert.equal(event.rate.toString(), '100')
    })
  })

  describe('Sell Tokens', async () => {
    let result
    before(async () => {
      // Approve token sending
      token.approve(jenzswap.address, tokens('100'), { from: invester })
      result = await jenzswap.sellTokens(tokens('100'), { from: invester })
    })

    it('Token was sold', async () => {
      // Check investor balance
      let investorBalance = await token.balanceOf(invester)

      assert.equal(investorBalance.toString(), tokens('0'))

      // Check jenzswap balance
      let jenzswapBalance = await token.balanceOf(jenzswap.address)

      assert.equal(jenzswapBalance.toString(), tokens('1000000'))

      // Check if jenzSwap ether amount went up
      let jenzswapEtherBalance = await web3.eth.getBalance(jenzswap.address)

      assert.equal(jenzswapEtherBalance.toString(), tokens('0'))

      const event = result.logs[0].args
      assert.equal(event.account, invester)
      assert.equal(event.token, token.address)
      assert.equal(event.amount.toString(), tokens('100'))
      assert.equal(event.rate.toString(), '100')

      // FAILURE: sell more than you have
      await jenzswap.sellTokens(tokens('500'), { from: invester }).should.be
        .rejected
    })
  })
})
