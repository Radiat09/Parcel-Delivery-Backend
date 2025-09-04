import { Request } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { AppError } from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IUser, Role } from "../user/user.interface";
import { User } from "../user/user.model";
import { parcelSearchableFields } from "./parcel.constant";
import { EStatus, IMongoUpdate, IParcel, IStatusLog } from "./parcel.interface";
import { Parcel } from "./parcel.model";

const createParcelService = async (payload: Partial<IParcel>) => {
  const { sender } = payload;

  const isUserExist = await User.findById(sender);

  if (!isUserExist) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You are not authorized user to create a parcel!"
    );
  }

  if (
    isUserExist.role === Role.DELIVERY_MAN ||
    isUserExist.role === Role.RECIVER
  ) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You are not authorized user to create a parcel!"
    );
  }

  const parcel = await Parcel.create(payload);

  return parcel;
};

const getAllParcelService = async (
  query: Record<string, string>,
  user: Partial<IUser>
) => {
  if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
    const queryBuilder = new QueryBuilder(Parcel.find(), query);

    const users = queryBuilder
      .search(parcelSearchableFields)
      .filter()
      .sort()
      .fields()
      .selectField("-_id")
      .paginate();

    const [data, meta] = await Promise.all([
      users
        .build()
        .populate("sender", "name email phone -_id")
        .select("-sender.id -sender._id"),

      queryBuilder.getMeta(),
    ]);
    return {
      data,
      meta,
    };
  } else {
    const userExist = await User.findOne({ email: user.email });
    let data;

    if (!userExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Invalid User request!");
    }
    if (user.role === Role.SENDER) {
      // Now `userExist` is a single document (or null)
      data = await Parcel.find({ sender: userExist._id });
    } else {
      data = await Parcel.find({ "receiver.email": userExist.email });
    }

    return { data, meta: { total: data?.length } }; // Maintain consistent return type
  }
};

const updateParcelService = async (req: Request) => {
  const user = req.user as JwtPayload;

  // console.log(user);
  const { trkId } = req.params;
  const updateData = req.body;

  // Find the parcel
  const parcel = await Parcel.findOne({ trackingId: trkId });
  if (!parcel) {
    throw new Error("Parcel not found");
  }

  // Check authorization
  if (user.role === Role.SENDER && !parcel.sender.equals(user.userId)) {
    throw new Error("Unauthorized - You can only update your own parcels");
  }

  // Initialize update object
  const update: IMongoUpdate = {};
  const statusLog: IStatusLog = {
    status: updateData.status || parcel.currentStatus,
    updatedBy: user.userId,
    note: updateData.note,
    createdAt: new Date(),
  };

  // Role-based update logic
  switch (user.role) {
    case Role.ADMIN:
    case Role.SUPER_ADMIN: {
      // Prepare all possible updates
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: Record<string, any> = {};

      if (updateData.receiver) {
        Object.entries(updateData.receiver).forEach(([key, value]) => {
          updates[`receiver.${key}`] = value;
        });
      }

      if (updateData.packageDetails) {
        Object.entries(updateData.packageDetails).forEach(([key, value]) => {
          updates[`packageDetails.${key}`] = value;
        });
      }

      if (updateData.fee !== undefined) updates.fee = updateData.fee;
      if (updateData.expectedDeliveryDate)
        updates.expectedDeliveryDate = updateData.expectedDeliveryDate;
      if (updateData.isBlocked !== undefined)
        updates.isBlocked = updateData.isBlocked;
      if (updateData.currentStatus)
        updates.currentStatus = updateData.currentStatus;

      // Only set $set if there are updates
      if (Object.keys(updates).length > 0) {
        update.$set = updates;
      }

      if (updateData.status) {
        update.$push = { statusLog };
      }
      break;
    }

    case Role.SENDER: {
      if (!updateData.receiver || !updateData.currentStatus) {
        throw new Error(
          `You do not have the authority to update ${Object.keys(updateData)}`
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: Record<string, any> = {};

      if (updateData.receiver && parcel.currentStatus === EStatus.REQUESTED) {
        Object.entries(updateData.receiver).forEach(([key, value]) => {
          updates[`receiver.${key}`] = value;
        });
      }

      if (updateData.currentStatus === EStatus.CANCELLED) {
        if (parcel.currentStatus !== EStatus.REQUESTED) {
          throw new Error("You can only cancel requested parcels");
        }
        updates.currentStatus = EStatus.CANCELLED;
        update.$push = {
          statusLog: {
            status: EStatus.CANCELLED,
            updatedBy: user.userId,
            note: updateData.note || "Cancelled by sender",
            createdAt: new Date(),
          },
        };
      }

      if (Object.keys(updates).length > 0) {
        update.$set = updates;
      }
      break;
    }
    //** DELIVERY_MAN will be able to update only currentStatus to PICKED, IN_TRANSIT and DELIVERED *//
    case Role.DELIVERY_MAN: {
      if (!updateData.currentStatus) {
        throw new Error(
          `You do not have the authority to update ${Object.keys(updateData)}`
        );
      }

      const allowedStatuses = [
        EStatus.PICKED,
        EStatus.IN_TRANSIT,
        EStatus.DELIVERED,
      ];

      if (
        updateData.currentStatus &&
        !allowedStatuses.includes(updateData.currentStatus)
      ) {
        throw new Error(
          `You can not update this status ${Object.values(updateData)}`
        );
      }

      if (updateData.currentStatus) {
        update.$set = { currentStatus: updateData.currentStatus };
        if (updateData.currentStatus === EStatus.DELIVERED) {
          update.$set.actualDeliveryDate = new Date();
        }
        update.$push = { statusLog };
      }
      break;
    }

    default:
      throw new Error("Unauthorized role");
  }

  // Perform the update
  const updatedParcel = await Parcel.findOneAndUpdate(
    { trackingId: trkId },
    update,
    { new: true, runValidators: true }
  )
    .populate("sender", "name email phone")
    .populate("statusLog.updatedBy", "name role")
    .lean();

  return { data: updatedParcel };
};

export const ParcelServices = {
  createParcelService,
  getAllParcelService,
  updateParcelService,
};
