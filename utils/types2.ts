export type UserType = {
  id: string | number;
  _id?: string;
  name: string;
  lastname: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  role?: string;
  image: string;
  isActive?: boolean;
  company?: {
    id: string;
    name: string;
    logo?: string;
  };
  licenses?: Array<{
    id?: string;
    _id?: string;
    type: string;
    status: string;
    validFrom?: string;
    validUntil?: string;
    maxUsers?: number;
    maxCalls?: number;
    maxStorage?: number;
  }>;
  createdAt: string;
  updatedAt?: string;
  reviews: number;
};
