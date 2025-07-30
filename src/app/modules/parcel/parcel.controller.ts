import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { ParcelServices } from "./parcel.service";
import { IUser } from "../user/user.interface";

const createParcel = catchAsync(async (req: Request, res: Response) => {
  const result = await ParcelServices.createParcelService(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Parcel created succesfully!",
    data: result,
  });
});

const getAllParcel = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const user = req.user;

  const result = await ParcelServices.getAllParcelService(
    query as Record<string, string>,
    user as Partial<IUser>
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Parcel retrived succesfully!",
    data: result.data,
    meta: result.meta,
  });
});

const updateParcel = catchAsync(async (req: Request, res: Response) => {
  const result = await ParcelServices.updateParcelService(req);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Parcel updated succesfully!",
    data: result.data,
  });
});

export const ParcelControllers = {
  createParcel,
  getAllParcel,
  updateParcel,
};
