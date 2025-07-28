export enum status {
  requested = "requested",
  approved = "approved",
  picked = "picked",
  in_transit = "in_transit",
  delivered = "delivered",
  cancelled = "cancelled",
  returned = "returned",
}

export interface IStatusLog {
  status: status;
  updatedBy: string; // User ID
  timestamp: Date;
  note?: string;
}

export interface IPackageDetails {
  type: "document" | "package" | "fragile";
  weight: number; // in kg
  description?: string;
}

export interface IReceiverInfo {
  name: string;
  phone: string;
  address: string;
}

export interface IParcel {
  _id: string;
  trackingId: string;
  sender: string; // User ID
  receiver: IReceiverInfo;
  packageDetails: IPackageDetails;
  fee: number;
  currentStatus: status;
  statusLog: IStatusLog[];
  isBlocked: boolean;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  createdAt: Date;
}
