"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EPackageType = exports.EStatus = void 0;
var EStatus;
(function (EStatus) {
    EStatus["REQUESTED"] = "REQUESTED";
    EStatus["APPROVED"] = "APPROVED";
    EStatus["PICKED"] = "PICKED";
    EStatus["IN_TRANSIT"] = "IN_TRANSIT";
    EStatus["DELIVERED"] = "DELIVERED";
    EStatus["CANCELLED"] = "CANCELLED";
    EStatus["RETURNED"] = "RETURNED";
})(EStatus || (exports.EStatus = EStatus = {}));
var EPackageType;
(function (EPackageType) {
    EPackageType["DOCUMENT"] = "DOCUMENT";
    EPackageType["PACKAGE"] = "PACKAGE";
    EPackageType["FRAGILE"] = "FRAGILE";
})(EPackageType || (exports.EPackageType = EPackageType = {}));
