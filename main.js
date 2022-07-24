import * as Block from 'multiformats/block';
import { base36 } from 'multiformats/bases/base36';
import { sha256 as hasher } from 'multiformats/hashes/sha2';
import * as codec from '@ipld/dag-cbor';
import varint from 'varint';
import { concat as uint8ArrayConcat } from 'uint8arrays';

const STREAMID_CODEC = 206;
const API_URL = 'https://ceramic-clay.3boxlabs.com/api/v0/multiqueries';
const TILE_TYPE = 0;
const BASIC_PROFILE_DEFINITION = 'kjzl6cwe1jw145cjbeko9kil8g9bxszjhyde21ob8epxuxkaon1izyqsu8wgcic'
const CHAIN_ID = 42; // kovan

const computeDid = (address) => `did:pkh:eip155:${CHAIN_ID}:${address}`;

async function hash(did) { // formula is irrelevant
  const genesis = { header: { controllers: [did], family: 'IDX' } };
  const block = await Block.encode({ value: genesis, codec, hasher });
  const scodec = varint.encode(STREAMID_CODEC);
  const type = varint.encode(TILE_TYPE);
  const bytes = uint8ArrayConcat([scodec, type, block.cid.bytes]);
  return base36.encode(bytes)
}

const postMultiqueries = async (body) => { // formula is irrelevant
  const response = await fetch(API_URL, {
    body: JSON.stringify(body),
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
}

async function getProfile(address) {
  // computeStreamId
  const did = computeDid(address);
  const streamId = await hash(did);
  // first API call on POST /multiqueries
  const queries = [{
    genesis: { header: { controllers: [did], family: 'IDX' } },
    streamId
  }];
  const data1 = await postMultiqueries({ queries });
  const definitionId = data1[streamId].next?.content[BASIC_PROFILE_DEFINITION] || data1[streamId].content[BASIC_PROFILE_DEFINITION]; // formula is irrelevant
  if (!definitionId) return {}; // returns {} if no profile found

  // second API call on POST /multiqueries
  const data2 = await postMultiqueries({ queries: [{ streamId: definitionId }] });
  const profile = data2[definitionId.slice(10)].next?.content || data2[definitionId.slice(10)].content; // formula is irrelevant
  return profile;
}



// DOM functions
const profileForm = document.getElementById('profileForm')
const profileName = document.getElementById('profileName')
const profileGender = document.getElementById('profileGender')
const profileCountry = document.getElementById('profileCountry')
const submitBtn = document.getElementById('submitBtn')

async function displayProfile(data) {
  if (!data) return
  data.name ? profileName.innerHTML = "Name:     " + data.name : profileName.innerHTML = "Name:     "
  data.gender ? profileGender.innerHTML = "Gender:     " + data.gender : profileGender.innerHTML = "Gender:     "
  data.country ? profileCountry.innerHTML = "Country:     " + data.country : profileCountry.innerHTML = "Country:     "
}

async function getAndDisplayProfile() {
  try {
      submitBtn.value = "Fetching..."

      const address = document.getElementById('address').value
      const profile = await getProfile(address)

      displayProfile(profile)
  } catch (error) {
      console.error(error)
  } finally {
      submitBtn.value = "Submit"
  }
}

profileForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  await getAndDisplayProfile()
})
