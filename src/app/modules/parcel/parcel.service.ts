import { AppError } from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { IParcel } from "./parcel.interface";
import { Parcel } from "./parcel.model";
import httpStatus from "http-status-codes";

const createParcelService = async (payload: Partial<IParcel>) => {
  const { sender } = payload;

  const isUserExist = await User.findById(sender);

  if (!isUserExist) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You are not authorized user to create a parcel!"
    );
  }

  const parcel = await Parcel.create(payload);

  return parcel;
};

export const ParcelServices = {
  createParcelService,
};
