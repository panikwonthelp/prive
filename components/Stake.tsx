import { useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/bignumber";
import { nftDropContractAddress, stakingContractAddress } from "../consts/contractAddresses";
import { useWeb3 } from "../hooks/useWeb3";


interface Props {
  contract: Contract | null;
}

const Stake = ({ contract }: Props) => {
  const { address } = useWeb3();
  const [inputValue, setInputValue] = useState("");

  async function stakeNft(ids: string[]) {
    if (!address) return;
  
    const isApproved = await nftDropContractAddress?.isApproved(
      address,
      stakingContractAddress
    );
    if (!isApproved) {
      await nftDropContractAddress?.setApprovalForAll(stakingContractAddress, true);
    }
  
    if (ids.length === 0) {
      return; // return early if the ids array is empty
    }
  
    for (const id of ids) {
      await contract?.call("stake", [id]);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <input
        type="text"
        placeholder="Enter NFT ID(s) separated by commas"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        style={{ width: "80%", textAlign: "center" }}
      />
      <button onClick={() => stakeNft(inputValue.split(","))}>Stake NFT(s)</button>
    </div>
  );
};

export default Stake;
