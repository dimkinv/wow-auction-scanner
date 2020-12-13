import fs from 'fs';
import { parseLuaFile, watchAuctioneerFile } from './lua-parser';
import { startServer } from './server';

async function main(){
    // const r = await parseLuaFile('/Users/dv696w/Downloads/Auc-ScanData (1).lua');
    startServer();
    // watchAuctioneerFile('/Users/dv696w/Downloads/Auc-ScanData (1).lua', (map)=>{
    //     console.log('file changed');
    //     fs.writeFileSync('auction-records.json', JSON.stringify(map));
    // });
}    

main();

