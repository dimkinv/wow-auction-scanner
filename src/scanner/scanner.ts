import fs from 'fs';
import winston from 'winston';
import axios, { AxiosAdapter, AxiosError } from 'axios';

import { AuctionItemsMap } from '../auction-items-map';
import { parseLuaFile } from './lua-parser';
const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.metadata()
    ),
    transports: new winston.transports.Console({
        format: winston.format.colorize({})
    })
});


export function watchAuctioneerFile(path: string) {
    fs.watchFile(path, async () => {
        logger.info(`scanner:: new file content received, fetching file`);
        const content = fs.readFileSync(path, { encoding: 'utf8' });
        logger.info(`scanner:: file fetched, parsing`);
        const map = parseLuaFile(content);
        logger.info(`content parsed with ${Object.keys(map).length} items, sending to server`);

        try {
            const response = await axios.post('http://localhost:3000/records', map, {headers: {'content-type': 'application/json'}});
            logger.info(`scanner:: send records to server`);
        } catch (error) {
            const axiosError = error as AxiosError
            logger.error(`scanner:: error sending data to server`, axiosError.message);
        }
    });
}

const filepath = process.argv[2];
logger.info(`scanner:: initiating watcher for ${filepath} path`);
watchAuctioneerFile(filepath);