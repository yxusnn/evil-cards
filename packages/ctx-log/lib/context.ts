import type { FastifyRequest } from "fastify"

export type ReqContext = {
  reqId: string
}

export function createCtxFromReq(req: FastifyRequest): ReqContext {
  return {
    reqId: req.id
  }
}

export function createInternalCtx(): ReqContext {
  return {
    reqId: "internal"
  }
}