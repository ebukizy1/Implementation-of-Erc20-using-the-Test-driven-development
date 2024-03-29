import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect, assert } from "chai";
import { ethers } from "hardhat";

describe.only("ERC20 Token Contract ", async()=>{
    const deployErc20TokenContract = async()=>{
        const tokenName = "EMAXTOKEN";
        const symbol = "MAX";
        const decimal = 18;
        const totalSupply = 1000000;
        const tokenToTransfer = 10000000;

        const [owner, otherAccount] = await ethers.getSigners();
        const Erc20Token = await ethers.getContractFactory("Erc20Token");
        const erc20Token  = await Erc20Token.deploy(tokenName, symbol, totalSupply);
        return {erc20Token, owner, tokenName, symbol, decimal, totalSupply, otherAccount, tokenToTransfer};
    }
    describe("Deployment Testing", async () => {
        it("should test that the contract can be deployed", async () => {
            const { erc20Token, tokenName, symbol, decimal, totalSupply } = await loadFixture(deployErc20TokenContract);
            assert.isNotNull(erc20Token);
            expect(await erc20Token.tokenName()).to.equal(tokenName);
            expect(await erc20Token.symbol()).to.equal(symbol);
            expect(await erc20Token.decimal()).to.equal(decimal);
            expect(await erc20Token.totalSupply()).to.equal(totalSupply);

        });
    });
    describe("Transfer Test", async () => {
        it("test should transfer ERC20 tokens", async () => {
            const { erc20Token, owner, otherAccount, tokenToTransfer } = await loadFixture(deployErc20TokenContract);
            const tokenTransfer = 1000;
            // Get initial balances
            const ownerBalanceBefore = await erc20Token.balanceOf(owner.address);
            const otherAccountBalanceBefore = await erc20Token.balanceOf(otherAccount.address);
    
            // Perform the transfer
            await erc20Token.connect(owner).transfer(otherAccount.address, tokenTransfer);
    
            // Get updated balances after the transfer
            const ownerBalanceAfter = await erc20Token.balanceOf(owner.address);
            const otherAccountBalanceAfter = await erc20Token.balanceOf(otherAccount.address);
    
            // Assert that the balances have been updated correctly
            expect(Number(ownerBalanceAfter)).to.equal(Number(ownerBalanceBefore) - tokenTransfer);
            expect(Number(otherAccountBalanceAfter)).to.equal(Number(otherAccountBalanceBefore) + tokenTransfer);

        });

        describe("transfer validation", async ()=>{
            it("test that amount cannot greater than the balnce cannot be transfer", async () => {

                const { erc20Token, owner, otherAccount,tokenToTransfer } = await loadFixture(deployErc20TokenContract);
        
               
                await expect(erc20Token.connect(owner).transfer(otherAccount.address, tokenToTransfer))
                .to.be.rejectedWith("insufficient funds");
            });
        });

        describe("Event Test for Transfer", async ()=>{
            it("test that after transfer event can be emited ", async()=>{
                const tokenTransfer = 10000;
                const { erc20Token, owner, otherAccount } = await loadFixture(deployErc20TokenContract);

                // await expect (erc20Token.connect(owner).transfer(otherAccount.address, tokenTransfer))
                await expect(erc20Token.connect(owner).transfer(otherAccount.address, 10000))

            
                .to.emit(erc20Token, "Transfer").withArgs(owner.address, otherAccount.address, tokenTransfer);
            });
        });

        describe("Approval Test", async () => {
            it("should allow the owner to approve someone to spend money", async () => {
                const amountToSpend = 2000;
                const { erc20Token, owner, otherAccount, totalSupply } = await loadFixture(deployErc20TokenContract);
        
                // Check the initial allowance, it should be zero
                const initialAllowance = await erc20Token.allowance(owner.address, otherAccount.address);
                expect(initialAllowance).to.equal(0);
        
                // Approve otherAccount to spend amountToSpend
                await erc20Token.connect(owner).approve(otherAccount.address, amountToSpend);
        
                // Check the updated allowance
                const updatedAllowance = await erc20Token.allowance(owner.address, otherAccount.address);
                expect(updatedAllowance).to.equal(amountToSpend);
            });
        });
        describe("Event Test for Approval", async ()=>{
            it("test that after Approval event can be emited ", async()=>{
                const amountToSpend = 2000;
                const { erc20Token, owner, otherAccount, totalSupply } = await loadFixture(deployErc20TokenContract);
        
                // Check the initial allowance, it should be zero
                const initialAllowance = await erc20Token.allowance(owner.address, otherAccount.address);
                expect(initialAllowance).to.equal(0);
        
                // Approve otherAccount to spend amountToSpend
                await expect(erc20Token.connect(owner).approve(otherAccount.address, amountToSpend))
                .to.emit(erc20Token, "Approval").withArgs(owner, otherAccount, amountToSpend);
            });
        });
        describe("Transfer From Test", async () => {
            it("should allow the spender to spend from the transferFrom", async () => {
                const amountToSpend = 2000;
                const { erc20Token, owner, otherAccount, totalSupply } = await loadFixture(deployErc20TokenContract);
        
                // Check the initial allowance, it should be zero
                const initialAllowance = await erc20Token.allowance(owner.address, otherAccount.address);
                expect(initialAllowance).to.equal(0);
        
                // Approve otherAccount to spend amountToSpend
                await erc20Token.connect(owner).approve(otherAccount.address, amountToSpend);
        
                // Check the updated allowance
                const updatedAllowance = await erc20Token.allowance(owner.address, otherAccount.address);
                expect(updatedAllowance).to.equal(amountToSpend);
        
                // Check the initial balances
                const initialOwnerBalance = await erc20Token.balanceOf(owner.address);
                const initialOtherAccountBalance = await erc20Token.balanceOf(otherAccount.address);
        
                // Transfer amountToSpend from owner to otherAccount using transferFrom
                await erc20Token.connect(otherAccount).transferFrom(owner.address, otherAccount.address, amountToSpend);
        
                // Check the updated balances after the transfer
                const updatedOwnerBalance = await erc20Token.balanceOf(owner.address);
                const updatedOtherAccountBalance = await erc20Token.balanceOf(otherAccount.address);
        
                // Verify that the balances have been updated correctly
                expect(updatedOwnerBalance).to.equal(Number(initialOwnerBalance) - amountToSpend);
                expect(updatedOtherAccountBalance).to.equal(Number(initialOtherAccountBalance) + amountToSpend);
        
                // Verify that the allowance has been updated after transferFrom
                const finalAllowance = await erc20Token.allowance(owner.address, otherAccount.address);
                expect(finalAllowance).to.equal(0); // Allowance should be zero after the transfer
            });
        });
        describe("Transfer from Validation ", async()=>{
            it("test that amount cannot be greater than allowance to spend", async()=>{
                const amountToSpend = 2000;
                const inValidAmount = 20000;
                const { erc20Token, owner, otherAccount, totalSupply } = await loadFixture(deployErc20TokenContract);
                // Check the initial allowance, it should be zero
                const initialAllowance = await erc20Token.allowance(owner.address, otherAccount.address);
                expect(initialAllowance).to.equal(0);
                await erc20Token.connect(owner).approve(otherAccount.address, amountToSpend);

                // Check the updated allowance
                const updatedAllowance = await erc20Token.allowance(owner.address, otherAccount.address);
                expect(updatedAllowance).to.equal(amountToSpend);

                await expect(erc20Token.connect(otherAccount).transferFrom(owner.address, otherAccount.address, inValidAmount))
                .to.rejectedWith("Insufficient allowance");
            });
            
            it("test that amount cannot be greater than balance ", async()=>{
                const amountToSpend = 2000;
                const inValidAmount = 20000000;
                const { erc20Token, owner, otherAccount, totalSupply } = await loadFixture(deployErc20TokenContract);
                // Check the initial allowance, it should be zero
                const initialAllowance = await erc20Token.allowance(owner.address, otherAccount.address);
                expect(initialAllowance).to.equal(0);
                await erc20Token.connect(owner).approve(otherAccount.address, amountToSpend);

                // Check the updated allowance
                const updatedAllowance = await erc20Token.allowance(owner.address, otherAccount.address);
                expect(updatedAllowance).to.equal(amountToSpend);
 
                await expect(erc20Token.connect(otherAccount).transferFrom(owner.address, otherAccount.address, inValidAmount))
                .to.rejectedWith( "Insufficient balance");
            });
            
                
        });
  
      
    });
    
    });

    
