interface Order {
    buyout: number;
    bid: number;
    name: string;
    seller:string;
    amount: number;
}

interface AuctionItem {
    orders: Order[],
    minStackPrice?: number;
    medianPrice?: number;
}

export interface AuctionItemsMap {
    [id: string]: AuctionItem
}