import { Web3Provider } from "@ethersproject/providers";
import { ContractTransaction } from "@ethersproject/contracts";

import { OSBlock as OSBlock, IPFSCallback, NewBlockCallbacks } from "./types";
import { addBlockDateTime } from "./utils";
import { ValidateBlock } from "./utils";
import { Hexa__factory } from "@relational-os/contracts";

const HEXA_CONTRACT_ADDRESS = "0xA571D2C89FCA25c498bc8c13D882382254C556ac";

export const INVALID_TOKEN_ID = 0x0;

export class RelationalOS {
  private contractAddress: string = HEXA_CONTRACT_ADDRESS;
  private graphURL: string = "https://TODO";
  private ipfsURL: string = "https://ipfs.buzzard.life";
  private provider?: Web3Provider;

  constructor(provider: Web3Provider) {
    this.provider = provider;
  }

  public getContract() {
    if (!this.provider) throw new Error("Missing Provider.");
    return Hexa__factory.connect(
      this.contractAddress,
      this.provider.getSigner()
    );
  }

  public async newBlock(
    block: OSBlock,
    callbacks?: NewBlockCallbacks
  ): Promise<ContractTransaction> {
    // Add the datetime to the block
    // TODO: only do this if the block does not have a valid datetime?
    // a case for this could be a block failed to submit or something?
    block = addBlockDateTime(block);

    // Ensure the block is valid before submitting
    ValidateBlock(block);

    const ipfsHash = await this.CreateBlockOnIPFS(
      block,
      callbacks?.IPFSUploadComplete
    );

    return await this.getContract().mint(ipfsHash);
  }

  /* Alternate form of newBlock, where can use callbacks to get if a contract
     is confirmed or not. Ideally this get's separated out to be generic
     for ContractTransaction. */
  public async newBlock2(
    block: OSBlock,
    callbacks: NewBlockCallbacks
  ): Promise<number> {
    // Add the datetime to the block
    // TODO: only do this if the block does not have a valid datetime?
    // a case for this could be a block failed to submit or something?
    block = addBlockDateTime(block);

    // Ensure the block is valid before submitting
    ValidateBlock(block);

    const ipfsHash = await this.CreateBlockOnIPFS(
      block,
      callbacks.IPFSUploadComplete
    );

    return await this.NewBlockOnChain(block, ipfsHash, callbacks);
  }

  private async NewBlockOnChain(
    block: OSBlock,
    hash: string,
    callbacks: NewBlockCallbacks
  ): Promise<number> {
    const contract = this.getContract();

    const tx = await (async () => {
      if (block.parent) {
        // Edit Block
        // TODO: replace dummy data with real TokenID
        return await contract.updateURI(1, hash);
      } else {
        // Create Block
        return await contract.mint(hash);
      }
    })();
    if (callbacks.TxSubmitted) callbacks.TxSubmitted();

    const receipt = await tx.wait(2);
    if (callbacks.TxConfirmed) callbacks.TxConfirmed();

    if (receipt.events) {
      const event = receipt.events.pop();
      if (event && event.args) {
        return event.args["tokenId"];
      }
    }

    return INVALID_TOKEN_ID;
  }

  // TODO: support images
  private async CreateBlockOnIPFS(
    block: OSBlock,
    uploadComplete?: IPFSCallback
  ): Promise<string> {
    let uploadURL = `${this.ipfsURL}/uploadJSON`;
    console.log("pushing to", uploadURL);

    // upload to our IPFS bridge
    const { hash: blockHash } = await fetch(uploadURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(block),
    }).then((res) => {
      return res.json();
    });

    if (uploadComplete) uploadComplete(blockHash);

    return blockHash;
  }
}
