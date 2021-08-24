import fs from "fs";
import { ethers } from "ethers";
import dotenv from "dotenv";
import { abi } from "@openzeppelin/contracts/build/contracts/ERC20.json";

dotenv.config();

export const provider = new ethers.providers.InfuraProvider("homestead", process.env.INFURA_API_KEY);

const LP_TOKEN = "0xc7175038323562cB68E4BbdD379E9fE65134937f";
const FROM_BLOCK = 12974518;
const TO_BLOCK = parseInt(process.env.TO_BLOCK);
const BLACKLIST = ["0xE11fc0B43ab98Eb91e9836129d1ee7c3Bc95df50", "0x21e5d7ab4bbdcFc25cb09C8948e6485729246b0a"];

async function start() {
    const token = new ethers.Contract(LP_TOKEN, abi, provider);
    let content = "";
    const mintFilter = token.filters.Transfer(ethers.constants.AddressZero, null, null);
    (await token.queryFilter(mintFilter, FROM_BLOCK, TO_BLOCK)).forEach(event => {
        const { to } = event.args;
        if (to != ethers.constants.AddressZero && !BLACKLIST.includes(to)) {
            content += to + "," + event.blockNumber + "," + ethers.utils.formatEther(event.args.value) + "\n";
        }
    })
    const burnFilter = token.filters.Transfer(null, ethers.constants.AddressZero, null);
    (await token.queryFilter(burnFilter, FROM_BLOCK, TO_BLOCK)).forEach(event => {
        const { from } = event.args;
        if (from != ethers.constants.AddressZero && !BLACKLIST.includes(from)) {
            content += event.args.from + "," + event.blockNumber + ",-" + ethers.utils.formatEther(event.args.value) + "\n";
        }
    })
    fs.writeFileSync("pool.csv", content);
}

start().catch(console.warn);
