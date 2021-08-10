import { ethers } from "ethers";
import { OSBlock, BlockValidationResult } from "./types";

export const addBlockDateTime = (block: OSBlock): OSBlock => {
  block.datetime = new Date().toISOString();
  return block;
};

function isISODate(s: string) {
  // TODO: also require the TZ?
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(s)) return false;
  var d = new Date(s);
  return d.toISOString() === s;
}

export function ValidateBlock(block: OSBlock): BlockValidationResult {
  var result: BlockValidationResult = {
    valid: true,
    errors: [""],
  };

  // Verify parent points to a valid block (is this a cid?) or null

  // Verify the creator is an eth address
  if (block.creator && !ethers.utils.isAddress(block.creator)) {
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

  // Throw Errors
  if (!result.valid) {
    throw result.errors.join("\n");
  }

  return result;
}
