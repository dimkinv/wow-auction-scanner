import fs from 'fs';
import { AuctionItemsMap } from './auction-items-map';

export const cache: {
    prices: AuctionItemsMap
} = {
    prices: null
};

export function watchAuctioneerFile(path: string, callback: (auctionRecords: AuctionItemsMap) => void) {
    fs.watchFile(path, async () => {
        const map = parseLuaFile(path);
        callback(map);
    });
}

export function parseLuaFile(content: string) {
    const reg = /(?<=return {)(.|\s)+(?=,}",\s--)/g;

    const relevantData = reg.exec(content)[0];
    const parsedData = relevantData
        .replace(/}\,{/g, '},\n{')
        .replace(/\\/g, '')
        .replace(/{/g, '[')
        .replace(/}/g, ']')
        .replace(/nil/g, null)
        .replace(/,]/g, ']');

    fs.writeFileSync('temp.txt', `[${parsedData}]`);

    const recordsArray = JSON.parse(`[${parsedData}]`);
    const map: AuctionItemsMap = {};
    for (const recordArray of recordsArray) {
        map[recordArray[8]] = map[recordArray[8]] || { orders: [] };
        map[recordArray[8]].orders.push({
            name: recordArray[8],
            amount: recordArray[10],
            bid: recordArray[14],
            buyout: recordArray[16],
            seller: recordArray[19]
        });
    }

    for (const [name, value] of Object.entries(map)) {
        const numberOfOrders = value.orders.length;
        if (numberOfOrders % 2 === 0) {
            // means even
            const middle = numberOfOrders / 2;
            const nextToMiddle = middle + 1 === numberOfOrders ? middle : middle + 1;
            const medianPrice = (value.orders[middle].buyout + value.orders[nextToMiddle].buyout) / 2;
            value.medianPrice = medianPrice;
        } else {
            value.medianPrice = value.orders[Math.round(numberOfOrders / 2) - 1].buyout;
        }

        value.minStackPrice = value.orders.reduce((minBuyout, order) => order.amount === 20 && order.buyout < minBuyout ? order.buyout : minBuyout, Infinity);
    }
    cache.prices = map;
    return map;
}