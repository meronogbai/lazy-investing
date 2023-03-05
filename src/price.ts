import yahooFinance from "yahoo-finance2";

export const getCurrentPrice = async (ticker: string) => {
  const { regularMarketPrice } = await yahooFinance.quote(ticker);

  if (regularMarketPrice === undefined) {
    throw new Error(
      `Invalid regularMarketPrice (${regularMarketPrice}) for ticker (${ticker})`
    );
  }

  return regularMarketPrice;
};
