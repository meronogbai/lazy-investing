import { AxiosResponse } from "axios";
import { env } from "./env";
import {
  SessionApi,
  Configuration,
  OrderApi,
  AccountApi,
  PortfolioApi,
  ContractApi,
  IserverReplyReplyidPost200ResponseInner,
  IserverAccountAccountIdOrderPost200ResponseInner,
} from "./generated/ibkr-client";
import { getCurrentPrice } from "./price";

type OrderInput = {
  amount: number;
  ticker: string;
  yahooFinanceTicker: string;
};

export class Broker {
  private config = new Configuration({
    basePath: env.GATEWAY_URL,
  });

  private sessionApi = new SessionApi(this.config);
  private orderApi = new OrderApi(this.config);
  private accountApi = new AccountApi(this.config);
  private portfolioApi = new PortfolioApi(this.config);
  private contractApi = new ContractApi(this.config);

  async establishSession() {
    const {
      data: { authenticated },
    } = await this.sessionApi.iserverAuthStatusPost();

    const canExecuteOrder = authenticated;

    if (!canExecuteOrder) {
      throw new Error("You need to login to invest.");
    }

    await this.sessionApi.ssoValidateGet();
  }

  async submitOrder(options: OrderInput) {
    const accountId = await this.selectAccount();
    const order = await this.buildOrder(options, accountId);
    const submitOrderResponse =
      await this.orderApi.iserverAccountAccountIdOrdersPost(accountId, {
        orders: [order],
      });

    const orderId = submitOrderResponse.data[0].id;
    const question = submitOrderResponse.data[0].message?.[0];
    if (orderId && question) {
      await this.recursivelyConfirmOrderNotifications({
        orderId,
      });
    }
    console.log("✅ Submitted order.");
  }

  private async selectAccount() {
    const response = await this.accountApi.iserverAccountsGet();

    const selectedAccountId = response.data.selectedAccount;

    if (!selectedAccountId) {
      throw new Error(
        `Selected account doesn't exist: ${JSON.stringify(response.data)}`
      );
    }
    return selectedAccountId;
  }

  private async buildOrder(options: OrderInput, accountId: string) {
    const secdefSearchResponse = await this.contractApi.iserverSecdefSearchPost(
      {
        symbol: options.ticker,
      }
    );

    if (secdefSearchResponse.data.length !== 1) {
      throw new Error(`IBKR can't find conid for ${options.ticker}.`);
    }

    // wrong response type, why u do this ibkr??
    const conid = Number(secdefSearchResponse.data[0].conid);

    if (isNaN(conid)) {
      throw new Error(
        `Invalid conid: ${JSON.stringify(secdefSearchResponse.data[0])}`
      );
    }

    const price = await getCurrentPrice(options.yahooFinanceTicker);

    const portfolioLedgerResponse =
      await this.portfolioApi.portfolioAccountIdLedgerGet(accountId);

    const cash = portfolioLedgerResponse.data.BASE?.settledcash;

    if (cash === undefined) {
      throw new Error("Settled cash is undefined :(");
    }

    const amountToSpend = Math.min(options.amount, cash);

    const quantity = Math.floor(amountToSpend / price);

    return {
      orderType: "LMT",
      ticker: options.ticker,
      price,
      quantity,
      conid,
      side: "BUY",
      tif: "DAY",
    };
  }

  private async recursivelyConfirmOrderNotifications({
    orderId,
  }: {
    orderId: string;
  }) {
    const orderReplyResponse = (await this.orderApi.iserverReplyReplyidPost(
      orderId,
      {
        confirmed: true,
      }
    )) as AxiosResponse<
      | IserverReplyReplyidPost200ResponseInner[]
      | IserverAccountAccountIdOrderPost200ResponseInner[]
    >; // the return type from the generated client is wrong here

    if (
      "id" in orderReplyResponse.data[0] &&
      orderReplyResponse.data[0].id &&
      orderReplyResponse.data[0].message?.[0]
    ) {
      await this.recursivelyConfirmOrderNotifications({
        orderId: orderReplyResponse.data[0].id,
      });
    }
  }
}
