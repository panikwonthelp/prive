import {
  ConnectWallet,
  ThirdwebNftMedia,
  useAddress,
  useContract,
  useContractRead,
  useOwnedNFTs,
  useTokenBalance,
  Web3Button,
} from "@thirdweb-dev/react";
import { BigNumber, ethers } from "ethers";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import NFTCard from "../components/NFTCard";
import {
  nftDropContractAddress,
  stakingContractAddress,
  tokenContractAddress,
} from "../consts/contractAddresses";
import styles from "../styles/Home.module.css";

const Stake: NextPage = () => {
  const address = useAddress();
  const { contract: nftDropContract } = useContract(
    nftDropContractAddress,
    "nft-drop"
  );
  const { contract: tokenContract } = useContract(
    tokenContractAddress,
    "token"
  );
  const { contract, isLoading } = useContract(stakingContractAddress);
  const { data: ownedNfts } = useOwnedNFTs(nftDropContract, address);
  const { data: tokenBalance } = useTokenBalance(tokenContract, address);
  const [claimableRewards, setClaimableRewards] = useState<BigNumber>();
  const [inputValue, setInputValue] = useState<string>("");
  const [withdrawInputValue, setWithdrawInputValue] = useState<string>("");

  const { data: stakedTokens, refetch: refetchStakedTokens } = useContractRead(
    contract,
    "getStakeInfo",
    address
  );

  useEffect(() => {
    if (!contract || !address) return;

    async function loadClaimableRewards() {
      const stakeInfo = await contract?.call("getStakeInfo", address);
      setClaimableRewards(stakeInfo[1]);
    }

    loadClaimableRewards();
  }, [address, contract]);

  async function stakeNft(ids: number[]): Promise<void> {
  if (!address) return;

  const isApproved = await nftDropContract?.isApproved(
    address,
    stakingContractAddress
  );
  if (!isApproved) {
    await nftDropContract?.setApprovalForAll(stakingContractAddress, true);
  }

  try {
    await contract?.call("stake", ids);
    refetchStakedTokens();
  } catch (error: any) {
    if (error.name === "TransactionRevertedWithoutReasonError") {
      alert("Transaction cancelled");
    } else {
      console.log(error);
    }
  }
}
  async function withdrawNft(nftIds: number[]): Promise<void> {
    if (!address) return;
try {
await contract?.call("withdraw", nftIds);
} catch (error: any) {
if (error.name === "TransactionRevertedWithoutReasonError") {
alert("Transaction cancelled");
} else {
console.log(error);
}
}
}

return (
<div className={styles.container}>
<h1 className={styles.h1}>Stake Your NFTs</h1>
<input
type="text"
placeholder="Enter NFT ID(s) separated by commas"
value={inputValue}
onChange={(e) => setInputValue(e.target.value)}
/>
<button onClick={() => stakeNft(inputValue.split(",").map(Number))}>Stake NFT(s)</button>
<text className="text1">Enter NFT IDs separated by commas. Staking multiples NFTs at once will trigger multiples transactions.</text>
<hr className={`${styles.divider} ${styles.spacerTop}`} />
{!address ? (
    <ConnectWallet />
  ) : (
    <>
      <h2>Your Tokens</h2>
      <div className={styles.tokenGrid}>
        <div className={styles.tokenItem}>
          <h3 className={styles.tokenLabel}>Claimable Rewards</h3>
          <p className={styles.tokenValue}>
            <b>
              {!claimableRewards
                ? "Loading..."
                : ethers.utils.formatUnits(claimableRewards, 18)}
            </b>{" "}
            {tokenBalance?.symbol}
          </p>
        </div>
        <div className={styles.tokenItem}>
          <h3 className={styles.tokenLabel}>Current Balance</h3>
          <p className={styles.tokenValue}>
            <b>{tokenBalance?.displayValue}</b> {tokenBalance?.symbol}
          </p>
        </div>
      </div>

      <Web3Button
        action={(contract) => contract.call("claimRewards")}
        contractAddress={stakingContractAddress}
      >
        Claim Rewards
      </Web3Button>

      <hr className={`${styles.divider} ${styles.spacerTop}`} />
      <h2>Your Staked NFTs</h2>
      <div className={styles.nftBoxGrid}>
        {stakedTokens &&
          stakedTokens[0]?.map((stakedToken: BigNumber) => (
            <NFTCard
              tokenId={stakedToken.toNumber()}
              key={stakedToken.toString()}
            />
          ))}
      </div>

      <hr className={`${styles.divider} ${styles.spacerTop}`} />
      <h2>Unstake multiples NFTs</h2>
      <input
        type="text"
        placeholder="Enter NFT ID(s) separated by commas"
        value={withdrawInputValue}
        onChange={(e) => setWithdrawInputValue(e.target.value)}
      />
      <button onClick={() => withdrawNft(withdrawInputValue.split(",").map(Number))}>Withdraw NFT(s)</button>

      <text className="text1">Enter NFT IDs separated by commas. Withdrawing multiples NFTs at once will trigger only one transaction.</text>
      <hr className={`${styles.divider} ${styles.spacerTop}`} />
    </>
  )}
</div>
);
};

export default Stake;