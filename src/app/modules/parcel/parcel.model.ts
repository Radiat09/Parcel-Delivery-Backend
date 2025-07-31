import { Schema, model } from "mongoose";
import { EPackageType, EStatus, IParcel, IStatusLog } from "./parcel.interface";
import { AppError } from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { User } from "../user/user.model";
import { generateTrackingId } from "../../utils/generateTrackingId";

const statusLogSchema = new Schema<IStatusLog>({
  status: {
    type: String,
    enum: EStatus,
    default: EStatus.REQUESTED,
  },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  note: { type: String },
  createdAt: { type: Date },
});

const parcelSchema = new Schema<IParcel>(
  {
    trackingId: { type: String, unique: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      email: { type: String, required: true },
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

parcelSchema.pre<IParcel>("save", async function (next) {
  if (this.isNew) {
    // Only for new documents
    // Generate tracking ID
    if (!this.trackingId) {
      let isUnique = false;

      while (!isUnique) {
        this.trackingId = generateTrackingId();
        try {
          const exists = await Parcel.findOne({
            trackingId: this.trackingId,
          });
          if (!exists) {
            isUnique = true;
          }
        } catch (err) {
          return next(err as Error);
        }
      }

      if (!isUnique) {
        return next(
          new AppError(
            httpStatus.NOT_ACCEPTABLE,
            "Failed to generate unique tracking ID"
          )
        );
      }
    }

    // Add initial status log entry
    if (!this.statusLog || this.statusLog.length === 0) {
      this.statusLog = [
        {
          updatedBy: this.sender,
          status: EStatus.REQUESTED,
          note: "Parcel created",
          createdAt: new Date(),
        },
      ];
    }
  }
  next();
});

// In Parcel model's post-save hook
parcelSchema.post("save", async function (doc) {
  // If receiver is a registered user (has userId)
  if (doc.currentStatus === EStatus.DELIVERED) {
    await User.findByIdAndUpdate(doc.receiver.email, {
      $addToSet: { deliveryHistory: doc._id },
    });
  }
});

export const Parcel = model<IParcel>("Parcel", parcelSchema);
