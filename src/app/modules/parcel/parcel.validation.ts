import { z } from "zod";
import { EPackageType, EStatus } from "./parcel.interface";
import mongoose from "mongoose";

// Custom validator for MongoDB ObjectId
const objectIdSchema = z.string().refine(
  (value) => {
    return mongoose.Types.ObjectId.isValid(value);
  },
  {
    message: "Invalid MongoDB ObjectId",
  }
);

// Status Log Validation
const statusLogSchema = z.object({
  status: z.nativeEnum(EStatus),
  updatedBy: objectIdSchema,
  note: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Base Parcel Schema
const baseParcelSchema = z.object({
  sender: objectIdSchema,
  receiver: z.object({
    name: z
      .string()
      .min(2, "Receiver name must be at least 2 characters")
      .max(50, "Receiver name cannot exceed 50 characters"),
    phone: z.string().regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    }),
    address: z
      .string()
      .min(5, "Address must be at least 5 characters")
      .max(200, "Address cannot exceed 200 characters"),
    email: z
      .string({ invalid_type_error: "Email must be string" })
      .email({ message: "Invalid email address format." })
      .min(5, { message: "Email must be at least 5 characters long." })
      .max(100, { message: "Email cannot exceed 100 characters." }),
  }),
  packageDetails: z.object({
    type: z.nativeEnum(EPackageType),
    weight: z
      .number()
      .positive("Weight must be a positive number")
      .max(100, "Weight cannot exceed 100kg"),
    description: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),
  }),
  fee: z
    .number()
    .nonnegative("Fee cannot be negative")
    .max(10000, "Fee cannot exceed 10,000"),
  currentStatus: z.nativeEnum(EStatus).default(EStatus.REQUESTED),
  statusLog: z.array(statusLogSchema).optional(),
  isBlocked: z.boolean().default(false).optional(),
  expectedDeliveryDate: z
    .date()
    .min(new Date(), "Expected delivery date must be in the future")
    .optional(),
  actualDeliveryDate: z.date().optional(),
});

// Create Parcel Validation (for POST requests)
export const createParcelZodSchema = baseParcelSchema
  .pick({
    receiver: true,
    packageDetails: true,
    expectedDeliveryDate: true,
  })
  .extend({
    expectedDeliveryDate: z
      .string()
      .datetime()
      .transform((val) => new Date(val))
      .refine((date) => date > new Date(), {
        message: "Expected delivery date must be in the future",
      })
      .optional(),
  });

// Update Parcel Validation (for PATCH requests)
export const updateParcelZodSchema = z.object({
  receiver: z
    .object({
      name: z
        .string()
        .min(2, "Receiver name must be at least 2 characters")
        .max(50, "Receiver name cannot exceed 50 characters")
        .optional(),
      phone: z
        .string()
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
          message:
            "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
        })
        .optional(),
      address: z
        .string()
        .min(5, "Address must be at least 5 characters")
        .max(200, "Address cannot exceed 200 characters")
        .optional(),
    })
    .optional(),
  packageDetails: z
    .object({
      type: z.nativeEnum(EPackageType).optional(),
      weight: z
        .number()
        .positive("Weight must be a positive number")
        .max(100, "Weight cannot exceed 100kg")
        .optional(),
      description: z
        .string()
        .max(500, "Description cannot exceed 500 characters")
        .optional(),
    })
    .optional(),
  expectedDeliveryDate: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .refine((date) => date > new Date(), {
      message: "Expected delivery date must be in the future",
    })
    .optional(),
  isBlocked: z.boolean().optional(),
});

// Status Update Validation
export const updateParcelStatusZodSchema = z.object({
  status: z.nativeEnum(EStatus),
  note: z.string().max(500, "Note cannot exceed 500 characters").optional(),
});

// Tracking ID Param Validation
export const trackingIdParamSchema = z.object({
  trackingId: z.string().regex(/^TRK-[A-Z0-9]{6}-[A-Z0-9]{6}$/, {
    message: "Invalid tracking ID format. Expected format: TRK-XXXXXX-XXXXXX",
  }),
});

// Parcel ID Param Validation
export const parcelIdParamSchema = z.object({
  id: objectIdSchema,
});

// Query Params for filtering parcels
export const parcelQuerySchema = z.object({
  status: z.nativeEnum(EStatus).optional(),
  isBlocked: z.boolean().optional(),
  sortBy: z.enum(["createdAt", "expectedDeliveryDate", "fee"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.number().int().positive().max(100).optional(),
  page: z.number().int().positive().optional(),
});
