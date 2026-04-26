/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as assistant from "../assistant.js";
import type * as auth from "../auth.js";
import type * as compliance from "../compliance.js";
import type * as debug from "../debug.js";
import type * as documents from "../documents.js";
import type * as http from "../http.js";
import type * as ingest from "../ingest.js";
import type * as quiz from "../quiz.js";
import type * as seed from "../seed.js";
import type * as training from "../training.js";
import type * as user from "../user.js";
import type * as voice from "../voice.js";
import type * as voiceAgent from "../voiceAgent.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  assistant: typeof assistant;
  auth: typeof auth;
  compliance: typeof compliance;
  debug: typeof debug;
  documents: typeof documents;
  http: typeof http;
  ingest: typeof ingest;
  quiz: typeof quiz;
  seed: typeof seed;
  training: typeof training;
  user: typeof user;
  voice: typeof voice;
  voiceAgent: typeof voiceAgent;
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
