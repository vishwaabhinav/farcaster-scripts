import { MerkleAPIClient } from "@standard-crypto/farcaster-js";
import { Wallet } from "ethers";
import "dotenv/config";

const FC_MNEMONIC = process.env.FC_MNEMONIC;
if (!FC_MNEMONIC) {
    throw new Error('Missing Farcaster Recovery Phrase')
}

const wallet = Wallet.fromMnemonic(FC_MNEMONIC);
const apiClient = new MerkleAPIClient(wallet);

const USER = process.env.USER;
if (!USER) {
    throw new Error('Missing User from env');
}

const user = await apiClient.lookupUserByUsername(USER);
if (user === undefined) throw new Error("no such user");

const followees = await apiClient.fetchUserFollowing(user);

let count = 0;
while(true) {
    const {value: f, done} = await followees.next();
    if (done) {
        break;
    }
    try {
        const latestCast = await apiClient.fetchLatestCastForUser(f, true);
        console.log("Found user", f.username, new Date(latestCast.timestamp));
        if (!latestCast || isOldCast(latestCast)) {
            console.log("Unfollowing: ", f.username, new Date(latestCast.timestamp));
            await apiClient.unfollowUser(f);
            count++;
        }
    } catch (e) {
        console.log(e);
    }
}

console.log(` ==== Unfollowed ${count} ====`);

function isOldCast(cast: any): boolean {
    return new Date(cast.timestamp) < new Date(2022, 12, 15);
}