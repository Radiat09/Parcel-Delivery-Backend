"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelServices = void 0;
const AppError_1 = require("../../errorHelpers/AppError");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const parcel_constant_1 = require("./parcel.constant");
const parcel_model_1 = require("./parcel.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createParcelService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { sender } = payload;
    const isUserExist = yield user_model_1.User.findById(sender);
    if (!isUserExist) {
        throw new AppError_1.AppError(http_status_codes_1.default.CONFLICT, "You are not authorized user to create a parcel!");
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
            .paginate();
        const [data, meta] = yield Promise.all([
            users.build(),
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
    }
});
exports.ParcelServices = {
    createParcelService,
    getAllParcelService,
};
