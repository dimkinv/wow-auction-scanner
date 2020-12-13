interface Order {
    buyout: number;
    bid: number;
    name: string;
    seller:string;
    amount: number;
}

interface AuctionItem {
    orders: Order[],
    minPriceMaxStack: MinPriceMaxStack;
    medianPrice?: number;
}

export interface MinPriceMaxStack{
    amount?: number;
    price?: number;
}

export interface AuctionItemsMap {
    [id: string]: AuctionItem
}