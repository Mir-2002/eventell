import { proxyTo } from "../_proxy";

export const onRequest = proxyTo((env) => env.API_ORIGIN);
