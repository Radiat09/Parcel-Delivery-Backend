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
exports.Parcel = void 0;
const mongoose_1 = require("mongoose");
const parcel_interface_1 = require("./parcel.interface");
const generateTrackingId_1 = require("../../utils/generateTrackingId");
const AppError_1 = require("../../errorHelpers/AppError");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const user_model_1 = require("../user/user.model");
const statusLogSchema = new mongoose_1.Schema({
    status: {
        type: String,
        enum: parcel_interface_1.EStatus,
        default: parcel_interface_1.EStatus.REQUESTED,
    },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    note: { type: String },
    createdAt: { type: Date },
});
const parcelSchema = new mongoose_1.Schema({
    trackingId: { type: String, unique: true },
    sender: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        email: { type: String, required: true },
    },
    packageDetails: {
        type: {
            type: String,
            enum: parcel_interface_1.EPackageType,
            required: true,
        },
        weight: { type: Number, required: true },
        description: { type: String },
    },
    fee: { type: Number, required: true },
    currentStatus: {
        type: String,
        enum: parcel_interface_1.EStatus,
        default: parcel_interface_1.EStatus.REQUESTED,
    },
    statusLog: [statusLogSchema],
    isBlocked: { type: Boolean, default: false },
    expectedDeliveryDate: { type: Date },
    actualDeliveryDate: { type: Date },
}, {
    timestamps: true,
});
parcelSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew) {
            // Only for new documents
            // Generate tracking ID
            if (!this.trackingId) {
                let isUnique = false;
                while (!isUnique) {
                    this.trackingId = (0, generateTrackingId_1.generateTrackingId)();
                    try {
                        const exists = yield exports.Parcel.findOne({
                            trackingId: this.trackingId,
                        });
                        if (!exists) {
                            isUnique = true;
                        }
                    }
                    catch (err) {
                        return next(err);
                    }
                }
                if (!isUnique) {
                    return next(new AppError_1.AppError(http_status_codes_1.default.NOT_ACCEPTABLE, "Failed to generate unique tracking ID"));
                }
            }
            // Add initial status log entry
            if (!this.statusLog || this.statusLog.length === 0) {
                this.statusLog = [
                    {
                        updatedBy: this.sender,
                        status: parcel_interface_1.EStatus.REQUESTED,
                        note: "Parcel created",
                        createdAt: new Date(),
                    },
                ];
            }
        }
        next();
    });
});
// In Parcel model's post-save hook
parcelSchema.post("save", function (doc) {
    return __awaiter(this, void 0, void 0, function* () {
        // If receiver is a registered user (has userId)
        if (doc.currentStatus === parcel_interface_1.EStatus.DELIVERED) {
            yield user_model_1.User.findByIdAndUpdate(doc.receiver.email, {
                $addToSet: { deliveryHistory: doc._id },
            });
        }
    });
});
exports.Parcel = (0, mongoose_1.model)("Parcel", parcelSchema);
