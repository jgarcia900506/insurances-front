export interface Policy {
  id?: number;
  clientId: number;
  type: string;
  effectiveStartDate: string;
  effectiveEndDate: string;
  insuredAmount: number;
  status: boolean;
}
