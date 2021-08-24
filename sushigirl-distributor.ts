import fs from "fs";
import * as Papaparse from "papaparse";
import SkyUtil from "skyutil";

const SUSHI_GIRL_COUNT = 33;
const SNAPSHOT_BLOCK_NUMBER = 13086139;

const scores: { [account: string]: number } = {};
let totalScore = 0;

const pool = fs.readFileSync("pool.csv", "utf8").toString();
for (const texts of Papaparse.parse<string[]>(pool).data) {
    if (texts.length > 1) {
        const account = texts[0].trim();
        const blockNumber = parseInt(texts[1], 10);
        const amount = parseFloat(texts[2]);
        const score = amount * (SNAPSHOT_BLOCK_NUMBER - blockNumber);
        scores[account] = scores[account] === undefined ? score : scores[account] + score;
        totalScore += score;
    }
}

let series: { account: string, score: number }[] = [];
for (const [account, score] of Object.entries(scores)) {
    series.push({ account, score });
}
series = series.sort((a, b) => b.score - a.score);

const owned: { [account: string]: boolean } = {};
const sushiGirlOwners: { [sushiGirlId: number]: string } = {};
SkyUtil.repeat(SUSHI_GIRL_COUNT, (sushiGirlId) => {
    const retry = () => {
        let number = Math.random() * totalScore;
        for (const info of series) {
            number -= info.score;
            if (number < 0) {
                if (owned[info.account] === true) {
                    retry();
                } else {
                    sushiGirlOwners[sushiGirlId] = info.account;
                    owned[info.account] = true;
                }
                break;
            }
        };
    };
    retry();
});

const result: { "Sushi Girl": number, "Owner": string }[] = [];
for (const [sushiGirlId, account] of Object.entries(sushiGirlOwners)) {
    result.push({ "Sushi Girl": parseInt(sushiGirlId, 10), "Owner": account });
}

fs.writeFileSync("result.csv", Papaparse.unparse(result));
