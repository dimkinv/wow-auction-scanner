import fs from 'fs';
import { AuctionItemsMap, MinPriceMaxStack } from '../auction-items-map';
import { logger } from './logger';

export function parseLuaFile(content: string) {
    logger.info(`parser:: initiating parse, exrtacting initial values`);
    const reg = /(?<=return {)(.|\s)+(?=,}",\s--)/g;

    const relevantData = reg.exec(content)[0];
    const parsedData = relevantData
        .replace(/}\,{/g, '},\n{')
        .replace(/\\/g, '')
        .replace(/{/g, '[')
        .replace(/}/g, ']')
        .replace(/nil/g, null)
        .replace(/,]/g, ']');

    const recordsArray: any[][] = JSON.parse(`[${parsedData}]`);
    const map: AuctionItemsMap = {};
    for (const recordArray of recordsArray) {
        map[recordArray[8]] = map[recordArray[8]] || { orders: [], minPriceMaxStack: {} };
        map[recordArray[8]].orders.push({
            name: recordArray[8],
            amount: recordArray[10],
            bid: recordArray[14] / 10000,
            buyout: recordArray[16] / 10000,
            seller: recordArray[19],
        });
    }
    logger.info(`parser:: parsing success with ${recordsArray.length} records`);

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

        value.minPriceMaxStack = value.orders.reduce((minPriceMaxStack, order) => {
            if (order.buyout < minPriceMaxStack.price) {
                return {
                    amount: order.amount,
                    price: order.buyout / order.amount
                }
            }

            if (order.amount > minPriceMaxStack.amount) {
                return {
                    amount: order.amount,
                    price: order.buyout / order.amount
                }
            }

            return minPriceMaxStack;
        }, { amount: 0, price: Infinity } as MinPriceMaxStack);
    }
    logger.info(`parser:: parsing complete`);
    return map;
}