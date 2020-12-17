import fs from 'fs';
import { startServer } from './server/server';

async function main(){
    // const r = await parseLuaFile('/Users/dv696w/Downloads/Auc-ScanData (1).lua');
    startServer();
    // watchAuctioneerFile('/Users/dv696w/Downloads/Auc-ScanData (1).lua', (map)=>{
    //     console.log('file changed');
    //     fs.writeFileSync('auction-records.json', JSON.stringify(map));
    // });
}    

main();

