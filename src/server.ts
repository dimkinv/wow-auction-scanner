import express from 'express';
import jsontoxml from 'jsontoxml';
import bodyParser from 'body-parser';
import { cache, parseLuaFile } from './lua-parser';

export function startServer() {
    const app = express()
    app.use(bodyParser.text())
    const port = process.env.PORT || 3000;

    app.get('/items-names', (req, res) => {
        const items = jsontoxml(Object.keys(cache.prices));
        res.send(items);
    });

    app.get('/price', (req, res) => {
        const itemName = req.query.name as string;
        if (!cache.prices[itemName]) {
            res.sendStatus(404).end();
            return;
        }

        const minItem = cache.prices[itemName].orders
            .reduce((minItem, item) => item.buyout < minItem.buyout ? item : minItem, cache.prices[itemName].orders[0]);

        res.end((minItem.buyout / minItem.amount).toString());
    });

    app.post('/raw', (req, res) => {
        parseLuaFile(req.body);

        res.end();
    });

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    })
}