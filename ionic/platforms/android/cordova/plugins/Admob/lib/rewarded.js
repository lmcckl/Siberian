"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var shared_1 = require("./shared");
var RewardedAd = /** @class */ (function (_super) {
    __extends(RewardedAd, _super);
    function RewardedAd() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RewardedAd.prototype.isLoaded = function () {
        return shared_1.execAsync(shared_1.NativeActions.rewardedIsLoaded, [{ id: this.id }]);
    };
    RewardedAd.prototype.load = function () {
        return shared_1.execAsync(shared_1.NativeActions.rewardedLoad, [
            __assign(__assign({}, this.opts), { id: this.id }),
        ]);
    };
    RewardedAd.prototype.show = function () {
        return shared_1.execAsync(shared_1.NativeActions.rewardedShow, [{ id: this.id }]);
    };
    return RewardedAd;
}(shared_1.MobileAd));
exports.default = RewardedAd;
