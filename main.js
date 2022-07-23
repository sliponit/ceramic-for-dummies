import * as Block from 'multiformats/block';
import { base36 } from 'multiformats/bases/base36';
import { sha256 as hasher } from 'multiformats/hashes/sha2';
import * as codec from '@ipld/dag-cbor';
import varint from 'varint';
import { concat as uint8ArrayConcat } from 'uint8arrays';
import fetch from 'node-fetch';

const STREAMID_CODEC = 206;
const API_URL = 'https://ceramic-clay.3boxlabs.com/api/v0/multiqueries';
const TILE_TYPE = 0;
const BASIC_PROFILE_DEFINITION = 'kjzl6cwe1jw145cjbeko9kil8g9bxszjhyde21ob8epxuxkaon1izyqsu8wgcic'
const CHAIN_ID = 42; // kovan

const computeGenesis = (address) => ({
  "header": {
    "controllers": [
      `did:pkh:eip155:${CHAIN_ID}:${address}`
    ],
    "family": "IDX"
  }
})


async function computeStreamId(genesis) {
  const block = await Block.encode({ value: genesis, codec, hasher });
  const scodec = varint.encode(STREAMID_CODEC);
  const type = varint.encode(TILE_TYPE);
  const bytes = uint8ArrayConcat([scodec, type, block.cid.bytes]);
  return base36.encode(bytes)
}

const callApi = async (body) => {
  const response = await fetch(API_URL, {
    body: JSON.stringify(body),
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json();
  return data;
}

async function fetchProfile(address) {
  // computeStreamId
  const genesis = computeGenesis(address)
  const streamId = await computeStreamId(genesis);
  // first API call 
  const body1 = {
    queries: [{
      genesis,
      streamId
    }]
  };
  const data1 = await callApi(body1);
  const definitionId = data1[streamId].content[BASIC_PROFILE_DEFINITION]
  // second API call
  const body2 = { queries: [{ streamId: definitionId }] };
  const data2 = await callApi(body2);
  const profile = data2[definitionId.slice(10)].content
  return profile
}

fetchProfile('0x00826dcb58b67901a881786efd6fc668346518f7').then(console.log);

