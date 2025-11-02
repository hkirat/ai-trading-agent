import { NonceManagerType } from "./lighter-sdk-ts/nonce_manager";
import { SignerClient } from "./lighter-sdk-ts/signer";
import { AccountApi, ApiKeyAuthentication, IsomorphicFetchHttpLibrary, OrderApi, ServerConfiguration } from "./lighter-sdk-ts/generated";
import type { Account } from "./accounts";
import { API_KEY_INDEX, BASE_URL } from "./config";
import { MARKETS } from "./markets";
import { CandlestickApi, MarketInfo } from "./lighter-sdk-ts/generated";

export async function createPosition(account: Account, symbol: string, side: "LONG" | "SHORT", notionalDollarAmount: number) {
    if (notionalDollarAmount <= 0) {
        console.log(`[TradeSkipped] Notional amount is $0.00. (AI Confidence was near 0.0)`);
        return; 
    }
    
    const client = await SignerClient.create({
        url: BASE_URL,
        privateKey: account.apiKey,
        apiKeyIndex: API_KEY_INDEX,
        accountIndex: Number(account.accountIndex),
        nonceManagementType: NonceManagerType.API
    });

    const market = MARKETS[symbol as keyof typeof MARKETS];
    const candleStickApi = new CandlestickApi({
        baseServer: new ServerConfiguration<{  }>(BASE_URL, {  }),
        httpApi: new IsomorphicFetchHttpLibrary(),
        middleware: [],
        authMethods: {}
    }); 
    
    const candleStickData = await candleStickApi.candlesticks(market.marketId, '1m', Date.now() - 1000 * 60 * 5, Date.now(), 1, false);
    const latestPrice = candleStickData.candlesticks[candleStickData.candlesticks.length - 1]?.close;

    if (!latestPrice) {
        throw new Error(`No latest price found for ${symbol}. Cannot calculate trade quantity.`);
    }

    const unitQuantity = notionalDollarAmount / latestPrice;
    
    if (unitQuantity * market.qtyDecimals <= 0) {
        console.log(`[TradeSkipped] Calculated unit quantity (${unitQuantity.toFixed(4)}) is too small after conversion.`);
        return;
    }

    console.log(`[TRADE] Notional: $${notionalDollarAmount.toFixed(2)}, Price: $${latestPrice.toFixed(2)}, Units: ${unitQuantity.toFixed(4)}`);
    
    const response = await client.createOrder({
        marketIndex: market.marketId,
        clientOrderIndex: market.clientOrderIndex,
        baseAmount: unitQuantity * market.qtyDecimals,
        price: (side == "LONG" ? latestPrice * 1.01 : latestPrice * 0.99) * market.priceDecimals,
        isAsk: side == "LONG" ? false : true,
        orderType: SignerClient.ORDER_TYPE_MARKET,
        timeInForce: SignerClient.ORDER_TIME_IN_FORCE_IMMEDIATE_OR_CANCEL,
        reduceOnly: 0,
        triggerPrice: SignerClient.NIL_TRIGGER_PRICE,
        orderExpiry: SignerClient.DEFAULT_IOC_EXPIRY,
    });
    console.log(response);
}