"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareVersions = void 0;
const diff_js_1 = __importDefault(require("semver/functions/diff.js"));
const gt_js_1 = __importDefault(require("semver/functions/gt.js"));
const valid_js_1 = __importDefault(require("semver/functions/valid.js"));
const options_js_1 = require("../options.js");
const INITIAL = "initial";
const DIFFERENT = "different";
/**
 * Compare previously published versions with the package's current version.
 *
 * @param currentVersion The current package version.
 * @param publishedVersions The versions that have already been published.
 * @param options Configuration options
 * @returns The release type and previous version.
 */
function compareVersions(currentVersion, publishedVersions, options) {
    const { versions, "dist-tags": tags } = publishedVersions ?? {};
    const { strategy, tag: publishTag } = options;
    const oldVersion = (0, valid_js_1.default)(tags?.[publishTag.value]) ?? undefined;
    const isUnique = !versions?.includes(currentVersion);
    let type;
    if (isUnique) {
        if (!oldVersion) {
            type = INITIAL;
        }
        else if ((0, gt_js_1.default)(currentVersion, oldVersion)) {
            type = (0, diff_js_1.default)(currentVersion, oldVersion) ?? DIFFERENT;
        }
        else if (strategy.value === options_js_1.STRATEGY_ALL) {
            type = DIFFERENT;
        }
    }
    return { type, oldVersion };
}
exports.compareVersions = compareVersions;
//# sourceMappingURL=compare-versions.js.map