const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HBRToken", function () {
  async function deploy() {
    const [holder, alice, bob, spender] = await ethers.getSigners();
    const token = await ethers.deployContract("HBRToken", [holder.address]);
    return { token, holder, alice, bob, spender };
  }

  it("sets metadata and assigns the fixed supply to the initial holder", async function () {
    const { token, holder } = await deploy();

    expect(await token.name()).to.equal("HBR Token (Local Prototype)");
    expect(await token.symbol()).to.equal("HBR");
    expect(await token.decimals()).to.equal(18n);
    expect(await token.totalSupply()).to.equal(ethers.parseEther("1000000000"));
    expect(await token.balanceOf(holder.address)).to.equal(await token.totalSupply());
  });

  it("transfers tokens and preserves the total supply", async function () {
    const { token, holder, alice } = await deploy();
    const supplyBefore = await token.totalSupply();
    const amount = ethers.parseEther("125");

    await expect(token.transfer(alice.address, amount))
      .to.emit(token, "Transfer")
      .withArgs(holder.address, alice.address, amount);

    expect(await token.balanceOf(alice.address)).to.equal(amount);
    expect(await token.totalSupply()).to.equal(supplyBefore);
  });

  it("supports allowance and transferFrom with the standard ERC-20 boundary", async function () {
    const { token, holder, alice, bob, spender } = await deploy();
    const amount = ethers.parseEther("50");

    await token.approve(spender.address, amount);
    expect(await token.allowance(holder.address, spender.address)).to.equal(amount);

    await expect(token.connect(spender).transferFrom(holder.address, bob.address, amount))
      .to.emit(token, "Transfer")
      .withArgs(holder.address, bob.address, amount);
    expect(await token.allowance(holder.address, spender.address)).to.equal(0);
    expect(await token.balanceOf(bob.address)).to.equal(amount);

    await expect(token.connect(alice).transferFrom(holder.address, bob.address, 1))
      .to.be.revertedWithCustomError(token, "ERC20InsufficientAllowance");
  });

  it("rejects unauthorized spending and has no mint/admin entry point", async function () {
    const { token, holder, alice, bob } = await deploy();
    const amount = ethers.parseEther("1");

    await expect(token.connect(alice).transferFrom(holder.address, bob.address, amount))
      .to.be.revertedWithCustomError(token, "ERC20InsufficientAllowance");
    expect(token.mint).to.equal(undefined);
    expect(token.owner).to.equal(undefined);
  });

  it("rejects a zero initial holder", async function () {
    await expect(ethers.deployContract("HBRToken", [ethers.ZeroAddress]))
      .to.be.revertedWith("HBR: zero initial holder");
  });
});
