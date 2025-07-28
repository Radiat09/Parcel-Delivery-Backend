import { Schema, model } from "mongoose";
import { EPackageType, EStatus, IParcel, IStatusLog } from "./parcel.interface";

const statusLogSchema = new Schema<IStatusLog>(
  {
    status: {
      type: String,
      enum: EStatus,
      required: true,
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    note: { type: String },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const parcelSchema = new Schema<IParcel>(
  {
    trackingId: { type: String, unique: true, required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    packageDetails: {
      type: {
        type: String,
        enum: EPackageType,
        required: true,
      },
      weight: { type: Number, required: true },
      description: { type: String },
    },
    fee: { type: Number, required: true },
    currentStatus: {
      type: String,
      enum: EStatus,
      default: EStatus.REQUESTED,
    },
    statusLog: [statusLogSchema],
    isBlocked: { type: Boolean, default: false },
    expectedDeliveryDate: { type: Date },
    actualDeliveryDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Parcel = model<IParcel>("Parcel", parcelSchema);
