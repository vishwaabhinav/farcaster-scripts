import { MerkleAPIClient } from "@standard-crypto/farcaster-js";
import { Wallet } from "ethers";
import 'dotenv/config'

const FC_MNEMONIC = process.env.FC_MNEMONIC;
if (!FC_MNEMONIC) {
    throw new Error('Missing Farcaster Recovery Phrase')
}

const wallet = Wallet.fromMnemonic(FC_MNEMONIC);

const apiClient = new MerkleAPIClient(wallet);

const user = await apiClient.lookupUserByUsername("dwr");
if (user === undefined) throw new Error("no such user");

const followees = await apiClient.fetchUserFollowing(user);

while (true) {
    const { value: f, done } = await followees.next();

    if (done) {
        break;
    }

    console.log(f);

    try {
        await apiClient.followUser(f);
    } catch (e) {
        // ..
    }
}

