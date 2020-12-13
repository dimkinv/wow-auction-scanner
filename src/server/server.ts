import express from 'express';
import jsontoxml from 'jsontoxml';
import bodyParser from 'body-parser';
import { AuctionItemsMap } from '../auction-items-map';

let cachedRecords: AuctionItemsMap = {};

type Filter = 'names';
type PriceFilter = 'minPrice' | 'median';

export function startServer() {
    const app = express()
    app.use(bodyParser.json())
    const port = process.env.PORT || 3000;

    app.get('/records', (req, res) => {
        const filter = req.query.filter as Filter;

        switch (filter) {
            case 'names':
                const items = jsontoxml(Object.keys(cachedRecords));
                res.send(items);
                break;
            default:
                res.end(jsontoxml(cachedRecords))
        }
    });

    app.get('/price/:itemName', (req, res) => {
        const itemName = req.params.itemName;
        const filter = req.query.filter as PriceFilter;

        const item = cachedRecords[itemName]
        if (!item) {
            res.sendStatus(404).end();
            return;
        }

        switch (filter) {
            case 'median':
                res.send(item.medianPrice);
                break;
            case 'minPrice':
                res.send(jsontoxml(item.minPriceMaxStack));
                break;
            default:
                res.send(jsontoxml(item));  // ??? not working as expected
        }
    });

    app.post('/records', (req, res) => {
        const records = req.body as AuctionItemsMap;
        cachedRecords = records
        res.end();
    });

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    })
}

startServer();