import fs from "fs";
import { ethers } from "ethers";
import dotenv from "dotenv";
import { abi } from "@openzeppelin/contracts/build/contracts/ERC20.json";

dotenv.config();

export const provider = new ethers.providers.InfuraProvider("homestead", process.env.INFURA_API_KEY);

const LP_TOKEN = "0xc7175038323562cB68E4BbdD379E9fE65134937f";
const FROM_BLOCK = 12974518;
const TO_BLOCK = undefined;

async function start() {
    const token = new ethers.Contract(LP_TOKEN, abi, provider);
    let content = "";
    const mintFilter = token.filters.Transfer(ethers.constants.AddressZero, null, null);
    (await token.queryFilter(mintFilter, FROM_BLOCK, TO_BLOCK)).forEach(event => {
        if (event.args.to != ethers.constants.AddressZero) {
            content += event.args.to + "," + event.blockNumber + "," + ethers.utils.formatEther(event.args.value) + "\n";
        }
    })
    const burnFilter = token.filters.Transfer(null, ethers.constants.AddressZero, null);
    (await token.queryFilter(burnFilter, FROM_BLOCK, TO_BLOCK)).forEach(event => {
        if (event.args.from != ethers.constants.AddressZero) {
            content += event.args.from + "," + event.blockNumber + ",-" + ethers.utils.formatEther(event.args.value) + "\n";
        }
    })
    fs.writeFileSync("pool.csv", content);
}

start().catch(console.warn);
