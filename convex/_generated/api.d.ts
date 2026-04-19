/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ViktorSpacesEmail from "../ViktorSpacesEmail.js";
import type * as admin from "../admin.js";
import type * as amenities from "../amenities.js";
import type * as amenityWaitlist from "../amenityWaitlist.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as constants from "../constants.js";
import type * as featureGating from "../featureGating.js";
import type * as hoa from "../hoa.js";
import type * as http from "../http.js";
import type * as invitations from "../invitations.js";
import type * as leads from "../leads.js";
import type * as notifications from "../notifications.js";
import type * as onboarding from "../onboarding.js";
import type * as payroll from "../payroll.js";
import type * as properties from "../properties.js";
import type * as reserveFund from "../reserveFund.js";
import type * as residents from "../residents.js";
import type * as seedTestUser from "../seedTestUser.js";
import type * as shiftSwaps from "../shiftSwaps.js";
import type * as shifts from "../shifts.js";
import type * as staffMembers from "../staffMembers.js";
import type * as stripe from "../stripe.js";
import type * as subscriptions from "../subscriptions.js";
import type * as testAuth from "../testAuth.js";
import type * as timeTracking from "../timeTracking.js";
import type * as users from "../users.js";
import type * as viktorTools from "../viktorTools.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ViktorSpacesEmail: typeof ViktorSpacesEmail;
  admin: typeof admin;
  amenities: typeof amenities;
  amenityWaitlist: typeof amenityWaitlist;
  analytics: typeof analytics;
  auth: typeof auth;
  constants: typeof constants;
  featureGating: typeof featureGating;
  hoa: typeof hoa;
  http: typeof http;
  invitations: typeof invitations;
  leads: typeof leads;
  notifications: typeof notifications;
  onboarding: typeof onboarding;
  payroll: typeof payroll;
  properties: typeof properties;
  reserveFund: typeof reserveFund;
  residents: typeof residents;
  seedTestUser: typeof seedTestUser;
  shiftSwaps: typeof shiftSwaps;
  shifts: typeof shifts;
  staffMembers: typeof staffMembers;
  stripe: typeof stripe;
  subscriptions: typeof subscriptions;
  testAuth: typeof testAuth;
  timeTracking: typeof timeTracking;
  users: typeof users;
  viktorTools: typeof viktorTools;
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
