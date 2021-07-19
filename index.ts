import fetch from "node-fetch";
import Web3 from "web3";

const IPFS_NODE_ADDR = "https://ipfs.buzzard.life";

export type Block = {
  parent: Block | null;
  creator: string;
  datetime?: string;
  type: string;
  context: string;
  content: string;
};

type BlockValidationResult = {
  valid: boolean;
  errors: [string];
};

export type IPFSBlock = {
  hash: string;
  block: Block;
};

const addBlockDateTime = (block: Block): Block => {
  block.datetime = new Date().toISOString();
  return block;
};

function isISODate(s: string) {
  // TODO: also require the TZ?
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(s)) return false;
  var d = new Date(s);
  return d.toISOString() === s;
}

export function ValidateBlock(block: Block): BlockValidationResult {
  var result: BlockValidationResult = {
    valid: true,
    errors: [""],
  };

  // Verify parent points to a valid block (is this a cid?) or null

  // Verify the creator is an eth address (use web3.js)
  if (!Web3.utils.isAddress(block.creator)) {
    result.errors.push(
      `Address: ${block.creator} is not a valid Ethereum address`
    );
  }

  // Verify the datetime is ISO8061 + TZ
  if (block.datetime != null) {
    if (!isISODate(block.datetime)) {
      result.errors.push(
        `Datetime: ${block.datetime} is not in ISO8061 format`
      );
    }
  } else {
    result.errors.push(`The datetime field of the block is not filled out`);
  }

  return result;
}

// export type BlockQuery = {

// }

// export const QueryBlocks = async (query: BlockQuery): Promise<any> => {

// }

export const CreateBlock = async (block: Block): Promise<any> => {
  // Add the datetime to the block
  // TODO: only do this if the block does not have a valid datetime?
  // a case for this could be a block failed to submit or something?
  block = addBlockDateTime(block);

  // Ensure the block is valid before submitting
  let validationResults = ValidateBlock(block);

  // Throw Errors
  if (!validationResults.valid) {
    throw validationResults.errors.join("\n");
  }

  try {
    let uploadURL = `${IPFS_NODE_ADDR}/uploadJSON`;
    console.log("pushing to", uploadURL);

    // upload to our IPFS bridge
    const bridgeResponse = await fetch(uploadURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(block),
    }).then((res) => {
      return res.json();
    });

    console.log("brdigeResponse", bridgeResponse);

    const response: IPFSBlock = {
      hash: bridgeResponse.hash,
      block: block,
    };

    return response;
  } catch (error) {
    // TODO: better error handling
    console.log("error", error);
    return error;
  }
};
