import { proxyTo } from "../_proxy";

export const onRequest = proxyTo((env) => env.KEYCLOAK_ORIGIN);
