import { AxiosError } from "axios";
import { env } from "./env";
import {
  SessionApi,
  Configuration,
  OrderApi,
  AccountApi,
  PortfolioApi,
  ContractApi,
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

const main = async () => {
  const {
    data: { authenticated },
  } = await sessionApi.iserverAuthStatusPost();

  const canExecuteOrder = authenticated;
  await sessionApi.ssoValidateGet();
  if (!canExecuteOrder) {
    throw new Error("Need to login to execute order");
  }

  const {
    data: { selectedAccount },
  } = await accountApi.iserverAccountsGet();

  if (!selectedAccount) {
    throw new Error("cry and weep");
  }

  const secdefSearchResponse = await contractApi.iserverSecdefSearchPost({
    symbol: env.IBKR_TICKER,
  });

  if (secdefSearchResponse.data.length !== 1) {
    throw new Error("sad boy");
  }

  // wrong response type, why u do this ibkr??
  const conid = Number(secdefSearchResponse.data[0].conid);

  if (isNaN(conid)) {
    throw new Error("cry again");
  }

  const price = await getCurrentPrice(env.YAHOO_FINANCE_TICKER);

  const ledgerResponse = await portfolioApi.portfolioAccountIdLedgerGet(
    selectedAccount
  );

  const cash = ledgerResponse.data.BASE?.settledcash;

  if (cash === undefined) {
    throw new Error("Settled cash is undefined :(");
  }

  const quantity = Math.min(Math.floor(cash / price), 500);

  const ordersPostResponse = await orderApi.iserverAccountAccountIdOrdersPost(
    selectedAccount,
    {
      orders: [
        {
          orderType: "MKT",
          ticker: env.IBKR_TICKER,
          quantity,
          conid,
          side: "BUY",
          tif: "DAY",
        },
      ],
    }
  );

  if (ordersPostResponse.data.length === 1 && ordersPostResponse.data[0].id) {
    await orderApi.iserverReplyReplyidPost(ordersPostResponse.data[0].id, {
      confirmed: true,
    });
  }
};

main().catch((e) => {
  process.exitCode = 1;

  if (e instanceof AxiosError) {
    console.error(e.response?.data);
    return;
  }

  console.error(e);
});
