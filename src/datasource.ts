import { IntegrationBase, SqlQuery } from "@budibase/types"
import Stripe from "stripe"

class CustomIntegration implements IntegrationBase {
  private readonly stripe: Stripe

  constructor(config: { apiKey: string; }) {
    this.stripe = new Stripe(config.apiKey, {
      apiVersion: '2022-08-01'
    })
  }

  async create(query: Stripe.ChargeCreateParams) {
    return await this.stripe.charges.create(query)
  }

  async read(query: { id: string, customer: string; ending_before: string, limit: number, starting_after: string,
  extra: { [key:string]: string } }) {
    if (query.extra.type === "Balance") {
      return await this.stripe.balance.retrieve()
    }
    if (query.id) {
      return await this.stripe.charges.retrieve(query.id)
    }
    return await this.stripe.charges.list({
      customer: query.customer,
      ending_before: query.ending_before,
      limit: query.limit,
      starting_after: query.starting_after
    })
  }

  async update(query: {
    id: string, 
    customer: string,
    description: string,
    metadata: object,
    receipt_email: string,
    shipping: object
   }) {
    const { id, ...params } = query
    for (let key in params) {
      //@ts-ignore
      if (params[key] === "") {
        //@ts-ignore
        delete params[key]
      }
    }
    return await this.stripe.charges.update(id, params as Stripe.ChargeUpdateParams)
  }

  async capture(query: {
    id: string,
    amount: number,
    receipt_email: string,
    statement_descriptor: string
    statement_descriptor_suffix: string
  }) {
    const { id, ...params } = query
    return await this.stripe.charges.capture(id, params as Stripe.ChargeCaptureParams)
  }

  async search(query: SqlQuery) {
    return await this.stripe.charges.search({
      query: query.sql
    })
  }

  async listBalanceTransactions(query: { payout: string, currency: string, ending_before: string, limit: number, starting_after: string,
  extra: { [key:string]: string } }) {
    let { extra, ...params} = query
    //@ts-ignore
    params.type = query.extra.type
    return await this.stripe.balanceTransactions.list(params)
  }
}

export default CustomIntegration