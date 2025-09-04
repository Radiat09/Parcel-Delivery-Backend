"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelServices = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = require("../../errorHelpers/AppError");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const parcel_constant_1 = require("./parcel.constant");
const parcel_interface_1 = require("./parcel.interface");
const parcel_model_1 = require("./parcel.model");
const createParcelService = (payload) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { sender } = payload;
    const isUserExist = yield user_model_1.User.findById(sender);
    if (!isUserExist) {
      throw new AppError_1.AppError(
        http_status_codes_1.default.CONFLICT,
        "You are not authorized user to create a parcel!"
      );
    }
    if (
      isUserExist.role === user_interface_1.Role.DELIVERY_MAN ||
      isUserExist.role === user_interface_1.Role.RECIVER
    ) {
      throw new AppError_1.AppError(
        http_status_codes_1.default.CONFLICT,
        "You are not authorized user to create a parcel!"
      );
    }
    const parcel = yield parcel_model_1.Parcel.create(payload);
    return parcel;
});

const getAllParcelService = (query, user) => __awaiter(void 0, void 0, void 0, function* () {
    if (user.role === user_interface_1.Role.ADMIN || user.role === user_interface_1.Role.SUPER_ADMIN) {
        const queryBuilder = new QueryBuilder_1.QueryBuilder(parcel_model_1.Parcel.find(), query);
        const users = queryBuilder
            .search(parcel_constant_1.parcelSearchableFields)
            .filter()
            .sort()
            .fields()
            .selectField("-_id")
            .paginate();
        const [data, meta] = yield Promise.all([
            users
                .build()
                .populate("sender", "name email phone")
                .select("-sender.id -sender._id"),
            queryBuilder.getMeta(),
        ]);
        return {
            data,
            meta,
        };
    }
    else {
        const userExist = yield user_model_1.User.findOne({ email: user.email });
        let data;
        if (!userExist) {
            throw new AppError_1.AppError(http_status_codes_1.default.NOT_FOUND, "Invalid User request!");
        }
        if (user.role === user_interface_1.Role.SENDER) {
            // Now `userExist` is a single document (or null)
            data = yield parcel_model_1.Parcel.find({ sender: userExist._id });
        }
        else {
            data = yield parcel_model_1.Parcel.find({ "receiver.email": userExist.email });
        }
        return { data, meta: { total: data === null || data === void 0 ? void 0 : data.length } }; // Maintain consistent return type
  });


const updateParcelService = (req) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    // console.log(user);
    const { trkId } = req.params;
    const updateData = req.body;
    // Find the parcel
    const parcel = yield parcel_model_1.Parcel.findOne({ trackingId: trkId });
    if (!parcel) {
      throw new Error("Parcel not found");
    }
    // Check authorization
    if (
      user.role === user_interface_1.Role.SENDER &&
      !parcel.sender.equals(user.userId)
    ) {
      throw new Error("Unauthorized - You can only update your own parcels");
    }
    // Initialize update object
    const update = {};
    const statusLog = {
      status: updateData.status || parcel.currentStatus,
      updatedBy: user.userId,
      note: updateData.note,
      createdAt: new Date(),
    };
    // Role-based update logic
    switch (user.role) {
      case user_interface_1.Role.ADMIN:
      case user_interface_1.Role.SUPER_ADMIN: {
        // Prepare all possible updates
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updates = {};
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
      case user_interface_1.Role.SENDER: {
        if (!updateData.receiver || !updateData.currentStatus) {
          throw new Error(
            `You do not have the authority to update ${Object.keys(updateData)}`
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updates = {};
        if (
          updateData.receiver &&
          parcel.currentStatus === parcel_interface_1.EStatus.REQUESTED
        ) {
          Object.entries(updateData.receiver).forEach(([key, value]) => {
            updates[`receiver.${key}`] = value;
          });
        }
        if (updateData.currentStatus === parcel_interface_1.EStatus.CANCELLED) {
          if (parcel.currentStatus !== parcel_interface_1.EStatus.REQUESTED) {
            throw new Error("You can only cancel requested parcels");
          }
          updates.currentStatus = parcel_interface_1.EStatus.CANCELLED;
          update.$push = {
            statusLog: {
              status: parcel_interface_1.EStatus.CANCELLED,
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
      case user_interface_1.Role.DELIVERY_MAN: {
        if (!updateData.currentStatus) {
          throw new Error(
            `You do not have the authority to update ${Object.keys(updateData)}`
          );
        }
        const allowedStatuses = [
          parcel_interface_1.EStatus.PICKED,
          parcel_interface_1.EStatus.IN_TRANSIT,
          parcel_interface_1.EStatus.DELIVERED,
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
          if (
            updateData.currentStatus === parcel_interface_1.EStatus.DELIVERED
          ) {
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
    const updatedParcel = yield parcel_model_1.Parcel.findOneAndUpdate(
      { trackingId: trkId },
      update,
      { new: true, runValidators: true }
    )
      .populate("sender", "name email phone")
      .populate("statusLog.updatedBy", "name role")
      .lean();
    return { data: updatedParcel };
  });
exports.ParcelServices = {
  createParcelService,
  getAllParcelService,
  updateParcelService,
};
