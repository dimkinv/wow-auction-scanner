import fs from 'fs';
import express, { json } from 'express';
import jsontoxml from 'jsontoxml';
import bodyParser from 'body-parser';
import { AuctionItemsMap } from '../auction-items-map';
import morgan from 'morgan';

let cachedRecords: AuctionItemsMap = {};

type Filter = 'names' | 'name_prices_pairs';
type PriceFilter = 'minPrice' | 'median';

if (fs.existsSync('./records.json')) {
    cachedRecords = JSON.parse(fs.readFileSync('./records.json', 'utf8'));
}

export function startServer() {
    const app = express()
    app.use(morgan('common'));
    app.use(bodyParser.json())
    const port = process.env.PORT || 3000;

    app.get('/records', (req, res) => {
        const filter = req.query.filter as Filter;

        switch (filter) {
            case 'names':
                const names = Object.keys(cachedRecords).map(key => ({ name: 'name', text: key }));
                res.send(jsontoxml({ names }));
                break;
            case 'name_prices_pairs':
                const records = Object.entries(cachedRecords).map(([key, value]) => ({
                    name: 'record',
                    children: {
                        name: key,
                        price: value.minPriceMaxStack.price,
                        amount: value.minPriceMaxStack.amount
                    }
                }));

                res.end(jsontoxml({ records }))
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
        fs.writeFileSync('./records.json', JSON.stringify(records));

        res.end();
    });

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    })
}

startServer();