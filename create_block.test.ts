import { Block, CreateBlock } from ".";
import util from 'util'

import fetch from 'node-fetch'

const BASIC_TEST_BLOCK: Block = {
    "parent": null,
    "creator": "0x573Ee46799e2D854AD421aE1a21d4Dd5Ea24a72C",
    "type": "text",
    "context": "test context",
    "content": "test block"
}

test('Creates Block on IPFS', async () => {
    // 1. Create a block and has a hash on IPFS
    const block = await CreateBlock(BASIC_TEST_BLOCK)
    expect(block.hash !== "")

    // 2. Verify the IPFS hash has the content we put in
    // TODO: QUESTION: Use IPFS library directly to test?
    let fetchURL = `https://ipfs.io/ipfs/${block.hash}`

    // 2a. Ensure we get a good status back from the IPFS Gateway
    const ipfsGatewayResponse = await fetch(fetchURL)
    expect(ipfsGatewayResponse.ok)

    // 2b. Ensure the data we got from IPFS is the same data we sent to IPFS
    let data = await ipfsGatewayResponse.json()
    expect(util.isDeepStrictEqual(block.block, data))
})