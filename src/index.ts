import { AxiosError } from "axios";
import { env } from "./env";
import {
  SessionApi,
  Configuration,
  OrderApi,
  AccountApi,
  PortfolioApi,
  ContractApi,
  OrderRequest,
} from "./generated/ibkr-client";
import { getCurrentPrice } from "./price";

const config = new Configuration({
  basePath: env.GATEWAY_URL,
});

const sessionApi = new SessionApi(config);
const orderApi = new OrderApi(config);
const accountApi = new AccountApi(config);
const portfolioApi = new PortfolioApi(config);
const contractApi = new ContractApi(config);

const establishBrokerageSession = async () => {
  const {
    data: { authenticated },
  } = await sessionApi.iserverAuthStatusPost();

  const canExecuteOrder = authenticated;

  if (!canExecuteOrder) {
    throw new Error("You need to login to invest.");
  }

  await sessionApi.ssoValidateGet();
};

const getSelectedAccountId = async () => {
  const response = await accountApi.iserverAccountsGet();

  const selectedAccountId = response.data.selectedAccount;

  if (!selectedAccountId) {
    throw new Error(
      `Selected account doesn't exist: ${JSON.stringify(response.data)}`
    );
  }

  return selectedAccountId;
};

const buildOrder = async (accountId: string): Promise<OrderRequest> => {
  const secdefSearchResponse = await contractApi.iserverSecdefSearchPost({
    symbol: env.IBKR_TICKER,
  });

  if (secdefSearchResponse.data.length !== 1) {
    throw new Error(`IBKR can't find conid for ${env.IBKR_TICKER}.`);
  }

  // wrong response type, why u do this ibkr??
  const conid = Number(secdefSearchResponse.data[0].conid);

  if (isNaN(conid)) {
    throw new Error(
      `Invalid conid: ${JSON.stringify(secdefSearchResponse.data[0])}`
    );
  }

  const price = await getCurrentPrice(env.YAHOO_FINANCE_TICKER);

  const ledgerResponse = await portfolioApi.portfolioAccountIdLedgerGet(
    accountId
  );

  const cash = ledgerResponse.data.BASE?.settledcash;

  if (cash === undefined) {
    throw new Error("Settled cash is undefined :(");
  }

  const MAX_QUANTITY = 500;
  const quantity = Math.min(Math.floor(cash / price), MAX_QUANTITY);

  return {
    orderType: "LMT",
    ticker: env.IBKR_TICKER,
    price,
    quantity,
    conid,
    side: "BUY",
    tif: "DAY",
  };
};

const respondToOrderMessages = async ({
  accountId,
  order,
}: {
  accountId: string;
  order: OrderRequest;
}) => {
  const submitOrderResponse = await orderApi.iserverAccountAccountIdOrdersPost(
    accountId,
    {
      orders: [order],
    }
  );

  if (submitOrderResponse.data[0].id) {
    const orderReplyResponse = await orderApi.iserverReplyReplyidPost(
      submitOrderResponse.data[0].id,
      {
        confirmed: true,
      }
    );

    // @ts-ignore
    if (orderReplyResponse.data[0].id) {
      const res = await orderApi.iserverReplyReplyidPost(
        submitOrderResponse.data[0].id,
        {
          confirmed: true,
        }
      );

      console.log("Order status", res.data[0]);
    }
  }
};

const main = async () => {
  await establishBrokerageSession();
  const accountId = await getSelectedAccountId();
  const order = await buildOrder(accountId);
  await respondToOrderMessages({ accountId, order });
  console.log("🚀 Order submitted successfully!");
};

main().catch((e) => {
  process.exitCode = 1;

  if (e instanceof AxiosError) {
    console.error(e.response?.data);
    return;
  }

  console.error(e);
});
