import { Request } from 'express';
import {
  IUser,
  SubscriptionPlatform,
  SubscriptionStatus,
} from '@ce/sba-db-models';
import 'express-session';
import { TransactionCategory } from '@ce/sba-transaction-api-def';
import { FiatCurrencyCode } from '@ce/currency';

/**
 * Allows us to request items which have a date field that is after the date 'after' in this type
 */
export type SyncParams = {
  after: Date;
};

export type GqlRequestContext = {
  req: Request;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    export interface Request {
      user?: IUser | null;
      subscriptionStatus?: SubscriptionStatus;
      subscriptionPlatform?: SubscriptionPlatform;
      centroSessionId?: string;
    }
  }
}

export type DocumentId = string;

export type ByCategoryAmount = {
  category: TransactionCategory;
  amount: ByCurrencyAmount[];
};

export type ByTagAmount = {
  tagId: string;
  amount: ByCurrencyAmount[];
};

export type ByCurrencyAmount = {
  currency: string;
  amount: number;
};

export type TimeRangeParams = {
  from: string;
  to: string;
};

declare module 'express-session' {
  export interface SessionData {
    userId?: string;
    centroSessionId?: string;
    forecastingUserLinkId?: string;
  }
}

export type HistoricalValuation = {
  time: string;
  value: number;
};

export type Country = {
  id: number;
  name: string;
  nativeName: string;
  iso2: string;
  currency: FiatCurrencyCode;
};

export type State = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

export type City = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

export type CountryStateCity = {
  country: Country;
  state: State;
  city: City;
};

export type AccountCollaboratorInvitation = {
  id: string;
  email: string;
  accountOwnerName: string;
  accountName: string;
  createdAt: Date;
};
