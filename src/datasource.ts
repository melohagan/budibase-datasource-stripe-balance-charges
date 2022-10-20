import { IntegrationBase, SqlQuery } from "@budibase/types"
import Stripe from "stripe"

class CustomIntegration implements IntegrationBase {
  private readonly stripe: Stripe

  constructor(config: { apiKey: string; }) {
    this.stripe = new Stripe(config.apiKey, {
      apiVersion: '2022-08-01'
    })
  }

  // { 
  //   amount: number,
  //   currency: string,
  //   customer: string,
  //   description: string,
  //   metadata: object,
  //   receipt_email: string,
  //   shipping: object,
  //   source: string,
  //   statement_descriptor: string
  //   statement_descriptor_suffix: string
  //  }
  async create(query: Stripe.ChargeCreateParams) {
    return await this.stripe.charges.create(query)
  }

  async read(query: { id: string, ending_before: string, limit: number, starting_after: string }) {
    if (query.id) {
      return await this.stripe.charges.retrieve(query.id)
    }
    return await this.stripe.charges.list(query)
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
}

export default CustomIntegration