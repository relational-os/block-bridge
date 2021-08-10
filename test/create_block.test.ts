import fetch from "node-fetch";
import { MockProvider } from "ethereum-waffle";
import util from "util";

import { OSBlock, IPFSCallback } from "../src/types";
import { RelationalOS } from "../src";

const BASIC_TEST_BLOCK: OSBlock = {
  parent: null,
  type: "text",
  context: "test context",
  content: "test block",
};

const provider = new MockProvider();

const verifyIPFS: IPFSCallback = async (hash: string) => {
  expect(hash !== "");

  // 2. Verify the IPFS hash has the content we put in
  // TODO: QUESTION: Use IPFS library directly to test?
  let fetchURL = `https://ipfs.io/ipfs/${hash}`;

  // 2a. Ensure we get a good status back from the IPFS Gateway
  const ipfsGatewayResponse = await fetch(fetchURL);
  expect(ipfsGatewayResponse.ok);

  // 2b. Ensure the data we got from IPFS is the same data we sent to IPFS
  let ipfsData = await ipfsGatewayResponse.json();
  expect(util.isDeepStrictEqual(BASIC_TEST_BLOCK, ipfsData));
};

test("Creates Block on IPFS", async () => {
  jest.setTimeout(10000);
  const os = new RelationalOS(provider);

  // 1. Create a block and has a hash on IPFS
  const block = await os.newBlock(BASIC_TEST_BLOCK, {
    IPFSUploadComplete: verifyIPFS,
  });
});
