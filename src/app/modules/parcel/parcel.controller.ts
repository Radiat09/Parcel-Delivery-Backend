import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { ParcelServices } from "./parcel.service";

const createParcel = catchAsync(async (req: Request, res: Response) => {
  const result = await ParcelServices.createParcelService(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Parcel created succesfully!",
    data: result,
  });
});

export const ParcelControllers = {
  createParcel,
};
