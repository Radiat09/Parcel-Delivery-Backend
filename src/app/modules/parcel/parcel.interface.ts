import { Types } from "mongoose";

export enum EStatus {
  REQUESTED = "REQUESTED",
  APPROVED = "APPROVED",
  PICKED = "PICKED",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED",
}

export enum EPackageType {
  DOCUMENT = "DOCUMENT",
  PACKAGE = "PACKAGE",
  FRAGILE = "FRAGILE",
}

export interface IStatusLog {
  status: EStatus;
  updatedBy: Types.ObjectId; // User ID
  note?: string;
}

export interface IPackageDetails {
  type: EPackageType;
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
  sender: Types.ObjectId; // User ID
  receiver: IReceiverInfo;
  packageDetails: IPackageDetails;
  fee: number;
  currentStatus: EStatus;
  statusLog: IStatusLog[];
  isBlocked: boolean;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
}
