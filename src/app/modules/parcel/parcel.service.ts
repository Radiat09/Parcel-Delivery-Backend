import { AppError } from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "../user/user.constants";
import { IUser, Role } from "../user/user.interface";
import { User } from "../user/user.model";
import { parcelSearchableFields } from "./parcel.constant";
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
      .paginate();

    const [data, meta] = await Promise.all([
      users.build(),
      queryBuilder.getMeta(),
    ]);
    return {
      data,
      meta,
    };
  } else {
    const userExist = await User.findOne({ email: user.email });

    if (!userExist) {
      throw new AppError(httpStatus.NOT_FOUND, "Invalid User request!");
    }

    // Now `userExist` is a single document (or null)
    const data = await Parcel.find({ sender: userExist._id });
    return { data, meta: { total: data?.length } }; // Maintain consistent return type
  }
};

export const ParcelServices = {
  createParcelService,
  getAllParcelService,
};
