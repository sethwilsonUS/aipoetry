/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as generate from "../generate.js";
import type * as generateImage from "../generateImage.js";
import type * as imageStyles from "../imageStyles.js";
import type * as initPoem from "../initPoem.js";
import type * as poems from "../poems.js";
import type * as rateLimiter from "../rateLimiter.js";
import type * as stylesConfig from "../stylesConfig.js";
import type * as topics from "../topics.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  generate: typeof generate;
  generateImage: typeof generateImage;
  imageStyles: typeof imageStyles;
  initPoem: typeof initPoem;
  poems: typeof poems;
  rateLimiter: typeof rateLimiter;
  stylesConfig: typeof stylesConfig;
  topics: typeof topics;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
