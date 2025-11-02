import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';
import { int, z } from 'zod';
import { PROMPT } from './prompt';
import { type Account } from './accounts';
import { getIndicators } from './stockData';
import { getOpenPositions } from './openPositions';
import { MARKETS } from './markets';
import { createPosition } from './createPosition';
import { cancelAllOrders } from './cancelOrder';
import { PrismaClient, ToolCallType } from './generated/prisma/client';
import { getPortfolio } from './getPortfolio';
const prisma = new PrismaClient();

// --- START: NEW DYNAMIC SIZING LOGIC ---

// Define the maximum percentage of available capital to allocate at 1.0 confidence.
// This sets your maximum risk per trade. (e.g., 20% of available cash)
const MAX_TRADE_ALLOCATION_PERCENT = 0.20; 


const calculateTradeSize = (availableCash: number, confidence: number): number => {
    // Ensure confidence is clamped between 0.0 and 1.0 for safety
    const clampedConfidence = Math.max(0.0, Math.min(1.0, confidence));

    // Calculate maximum dollar amount to allocate (Max risk per trade)
    const maxDollarAllocation = availableCash * MAX_TRADE_ALLOCATION_PERCENT;

    // Linearly scale the allocation based on confidence
    const dollarAllocation = maxDollarAllocation * clampedConfidence;

    return dollarAllocation; 
};

// --- END: NEW DYNAMIC SIZING LOGIC ---

export const invokeAgent = async (account: Account) => {
  const openrouter = createOpenRouter({
    apiKey: process.env['OPENROUTER_API_KEY'] ?? '',
  });

  let ALL_INDICATOR_DATA = "";
  const indicators = await Promise.all(Object.keys(MARKETS).map(async marketSlug => {
    const intradayIndicators = await getIndicators("5m", MARKETS[marketSlug].marketId);
    const longTermIndicators = await getIndicators("4h", MARKETS[marketSlug].marketId);
    
    ALL_INDICATOR_DATA = ALL_INDICATOR_DATA + `
    MARKET - ${marketSlug}
    Intraday (5m candles) (oldest → latest):
    Mid prices - [${intradayIndicators.midPrices.join(",")}]
    EMA20 - [${intradayIndicators.ema20s.join(",")}]
    MACD - [${intradayIndicators.macd.join(",")}]

    Long Term (4h candles) (oldest → latest):
    Mid prices - [${longTermIndicators.midPrices.join(",")}]
    EMA20 - [${longTermIndicators.ema20s.join(",")}]
    MACD - [${longTermIndicators.macd.join(",")}]

    `
  }))
  
  const portfolio = await getPortfolio(account);
  // Safely parse available cash as a number for use in dynamic sizing
  const availableCash = parseFloat(portfolio.available); 

  const openPositions = await getOpenPositions(account.apiKey, account.accountIndex);
  const modelInvocation = await prisma.invocations.create({
    data: {
      modelId: account.id,
      response: "",
    },
  });
  const enrichedPrompt = PROMPT.replace("{{INVOKATION_TIMES}}", account.invocationCount.toString())
  .replace("{{OPEN_POSITIONS}}", openPositions?.map((position) => `${position.symbol} ${position.position} ${position.sign}`).join(", ") ?? "")
  .replace("{{PORTFOLIO_VALUE}}", `$${portfolio.total}`)
  .replace("{{ALL_INDICATOR_DATA}}", ALL_INDICATOR_DATA)
  .replace("{{AVAILABLE_CASH}}", `$${portfolio.available}`)
  .replace("{{CURRENT_ACCOUNT_VALUE}}", `$${portfolio.total}`)
  .replace("{{CURRENT_ACCOUNT_POSITIONS}}", JSON.stringify(openPositions))

  console.log(enrichedPrompt)

  const response = streamText({
    model: openrouter(account.modelName),
    prompt: enrichedPrompt,
    tools: {
      createPosition: {
        description: 'Open a position in the given market. The AI must provide a confidence level for the size.',
        inputSchema: z.object({
          symbol: z.enum(Object.keys(MARKETS)).describe('The symbol to open the position at'),
          side: z.enum(["LONG", "SHORT"]),
          confidence: z.number().min(0.0).max(1.0).describe('AI confidence score (0.0 to 1.0). Used to calculate position size.'),
        }),
        execute: async ({ symbol, side, confidence }) => {
          
          // Calculate the dollar amount to trade based on available cash and confidence
          const tradeAmountDollars = calculateTradeSize(availableCash, confidence);

          // We pass the dollar amount. createPosition.ts will convert this to units.
          const quantityToTrade = tradeAmountDollars; 
          
          console.log(`[Trade Sizing] Calculated size: $${tradeAmountDollars.toFixed(2)} based on confidence: ${confidence}`);

          // Note: Removed the original line that reversed the side: `side = side === "LONG" ? "SHORT" : "LONG";`
          await createPosition(account, symbol, side, quantityToTrade);
          
          await prisma.toolCalls.create({
            data: {
              invocationId: modelInvocation.id,
              toolCallType: ToolCallType.CREATE_POSITION,
              metadata: JSON.stringify({ 
                symbol, 
                side, 
                confidence: confidence, // Log the AI's confidence
                calculatedTradeAmount: tradeAmountDollars.toFixed(2) // Log the size used
              }),
            },
          });
          return `Position opened successfully. Size used: $${tradeAmountDollars.toFixed(2)} (Confidence: ${confidence}).`;
        },
      },
      closeAllPosition: {
        description: 'Close all the currently open positions',
        inputSchema: z.object({}),
        execute: async () => {
          await cancelAllOrders(account);
          await prisma.toolCalls.create({
            data: {
              invocationId: modelInvocation.id,
              toolCallType: ToolCallType.CLOSE_POSITION,
              metadata: "",
            },
          });
          console.log(`All positions closed successfully`);
          return `All positions closed successfully`;
        },
      },
    },
  });

  await response.consumeStream();
  await prisma.models.update({
    where: { id: account.id },
    data: { invocationCount: { increment: 1 } } ,
  });
  await prisma.invocations.update({
    where: { id: modelInvocation.id },
    data: { response: (await response.text).trim() },
  });
  return response.text;
};

async function main() {
    const models = await prisma.models.findMany();

    for (const model of models) {
        await invokeAgent({
            apiKey: model.lighterApiKey,
            modelName: model.openRoutermodelName,
            name: model.name,
            invocationCount: model.invocationCount,
            id: model.id,
            accountIndex: model.accountIndex
        });
    }
}

setInterval(() => {
    main()
}, 1000 * 60 * 5);

main()