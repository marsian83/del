import "node";

export type Marketer = {
  name?: string;
  image?: string;
};

export type Arg = {
  name: string;
  typeName: string;
  description: string;
  htmlType: string;
};

export type User = {
  address: string;
  name?: string;
  image?: string;
  marketer?: Marketer;
};

export type Holder = {
  address: string;
  premium: number;
  claimExpiry: Date;
  args: object;
  status: "ongoing" | "expired";
};

export type Claim = {
  address: string;
  status: "requested" | "approved";
  amount: number;
  requestedAt: Date;
  approvedAt: Date;
};

export type Policy = {
  address: string;
  image?: string;
  cid: string;
  ratings: {
    address: string;
    rating: number;
  }[];
  tags?: string[];
  name: string;
  description: string;
  category: string;
  minimumClaim: number;
  maximumClaim: number;
  minimumDuration: number;
  maximumDuration: number;
  premiumFunc: string;
  premiumFuncDescription: string;
  premiumFuncArgs: Arg[];
  claimFunc: string;
  claimFuncDescription: string;
  claimFuncArgs: Arg[];
  creator: string;
  blockNumber: number;
  holders: Holder[];
  claims: Claim[];
  stakeToken: string;
  stakeTokenSymbol: string;
  stakers: string[];
  createdAt: string;
  updatedAt: string;
};
