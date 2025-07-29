"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parcelQuerySchema = exports.parcelIdParamSchema = exports.trackingIdParamSchema = exports.updateParcelStatusZodSchema = exports.updateParcelZodSchema = exports.createParcelZodSchema = void 0;
const zod_1 = require("zod");
const parcel_interface_1 = require("./parcel.interface");
const mongoose_1 = __importDefault(require("mongoose"));
// Custom validator for MongoDB ObjectId
const objectIdSchema = zod_1.z.string().refine((value) => {
    return mongoose_1.default.Types.ObjectId.isValid(value);
}, {
    message: "Invalid MongoDB ObjectId",
});
// Status Log Validation
const statusLogSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(parcel_interface_1.EStatus),
    updatedBy: objectIdSchema,
    note: zod_1.z.string().optional(),
    createdAt: zod_1.z.date().optional(),
    updatedAt: zod_1.z.date().optional(),
});
// Base Parcel Schema
const baseParcelSchema = zod_1.z.object({
    sender: objectIdSchema,
    receiver: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(2, "Receiver name must be at least 2 characters")
            .max(50, "Receiver name cannot exceed 50 characters"),
        phone: zod_1.z.string().regex(/^(?:\+8801\d{9}|01\d{9})$/, {
            message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
        }),
        address: zod_1.z
            .string()
            .min(5, "Address must be at least 5 characters")
            .max(200, "Address cannot exceed 200 characters"),
        email: zod_1.z
            .string({ invalid_type_error: "Email must be string" })
            .email({ message: "Invalid email address format." })
            .min(5, { message: "Email must be at least 5 characters long." })
            .max(100, { message: "Email cannot exceed 100 characters." }),
    }),
    packageDetails: zod_1.z.object({
        type: zod_1.z.nativeEnum(parcel_interface_1.EPackageType),
        weight: zod_1.z
            .number()
            .positive("Weight must be a positive number")
            .max(100, "Weight cannot exceed 100kg"),
        description: zod_1.z
            .string()
            .max(500, "Description cannot exceed 500 characters")
            .optional(),
    }),
    fee: zod_1.z
        .number()
        .nonnegative("Fee cannot be negative")
        .max(10000, "Fee cannot exceed 10,000"),
    currentStatus: zod_1.z.nativeEnum(parcel_interface_1.EStatus).default(parcel_interface_1.EStatus.REQUESTED),
    statusLog: zod_1.z.array(statusLogSchema).optional(),
    isBlocked: zod_1.z.boolean().default(false).optional(),
    expectedDeliveryDate: zod_1.z
        .date()
        .min(new Date(), "Expected delivery date must be in the future")
        .optional(),
    actualDeliveryDate: zod_1.z.date().optional(),
});
// Create Parcel Validation (for POST requests)
exports.createParcelZodSchema = baseParcelSchema
    .pick({
    receiver: true,
    packageDetails: true,
    expectedDeliveryDate: true,
})
    .extend({
    expectedDeliveryDate: zod_1.z
        .string()
        .datetime()
        .transform((val) => new Date(val))
        .refine((date) => date > new Date(), {
        message: "Expected delivery date must be in the future",
    })
        .optional(),
});
// Update Parcel Validation (for PATCH requests)
exports.updateParcelZodSchema = zod_1.z.object({
    receiver: zod_1.z
        .object({
        name: zod_1.z
            .string()
            .min(2, "Receiver name must be at least 2 characters")
            .max(50, "Receiver name cannot exceed 50 characters")
            .optional(),
        phone: zod_1.z
            .string()
            .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
            message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
        })
            .optional(),
        address: zod_1.z
            .string()
            .min(5, "Address must be at least 5 characters")
            .max(200, "Address cannot exceed 200 characters")
            .optional(),
    })
        .optional(),
    packageDetails: zod_1.z
        .object({
        type: zod_1.z.nativeEnum(parcel_interface_1.EPackageType).optional(),
        weight: zod_1.z
            .number()
            .positive("Weight must be a positive number")
            .max(100, "Weight cannot exceed 100kg")
            .optional(),
        description: zod_1.z
            .string()
            .max(500, "Description cannot exceed 500 characters")
            .optional(),
    })
        .optional(),
    expectedDeliveryDate: zod_1.z
        .string()
        .datetime()
        .transform((val) => new Date(val))
        .refine((date) => date > new Date(), {
        message: "Expected delivery date must be in the future",
    })
        .optional(),
    isBlocked: zod_1.z.boolean().optional(),
});
// Status Update Validation
exports.updateParcelStatusZodSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(parcel_interface_1.EStatus),
    note: zod_1.z.string().max(500, "Note cannot exceed 500 characters").optional(),
});
// Tracking ID Param Validation
exports.trackingIdParamSchema = zod_1.z.object({
    trackingId: zod_1.z.string().regex(/^TRK-[A-Z0-9]{6}-[A-Z0-9]{6}$/, {
        message: "Invalid tracking ID format. Expected format: TRK-XXXXXX-XXXXXX",
    }),
});
// Parcel ID Param Validation
exports.parcelIdParamSchema = zod_1.z.object({
    id: objectIdSchema,
});
// Query Params for filtering parcels
exports.parcelQuerySchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(parcel_interface_1.EStatus).optional(),
    isBlocked: zod_1.z.boolean().optional(),
    sortBy: zod_1.z.enum(["createdAt", "expectedDeliveryDate", "fee"]).optional(),
    sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
    limit: zod_1.z.number().int().positive().max(100).optional(),
    page: zod_1.z.number().int().positive().optional(),
});
