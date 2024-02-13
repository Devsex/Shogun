"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareAndPublish = void 0;
const index_js_1 = require("../npm/index.js");
const compare_versions_js_1 = require("./compare-versions.js");
const get_arguments_js_1 = require("./get-arguments.js");
/**
 * Get the currently published versions of a package and publish if needed.
 *
 * @param manifest The package to potentially publish.
 * @param options Configuration options.
 * @param environment Environment variables for the npm cli.
 * @returns Information about the publish, including if it occurred.
 */
async function compareAndPublish(manifest, options, environment) {
    const { name, version, packageSpec } = manifest;
    const cliOptions = {
        environment,
        ignoreScripts: options.ignoreScripts.value,
        logger: options.logger,
    };
    const viewArguments = (0, get_arguments_js_1.getViewArguments)(name, options);
    const publishArguments = (0, get_arguments_js_1.getPublishArguments)(packageSpec, options);
    let viewCall = await (0, index_js_1.callNpmCli)(index_js_1.VIEW, viewArguments, cliOptions);
    // `npm view` will succeed with no output the package exists in the registry
    // with no `latest` tag. This is only possible with third-party registries.
    // https://github.com/npm/cli/issues/6408
    if (!viewCall.successData && !viewCall.error) {
        // Retry the call to `npm view` with the configured publish tag,
        // to at least try to get something.
        const viewWithTagArguments = (0, get_arguments_js_1.getViewArguments)(name, options, true);
        viewCall = await (0, index_js_1.callNpmCli)(index_js_1.VIEW, viewWithTagArguments, cliOptions);
    }
    if (viewCall.error && viewCall.errorCode !== index_js_1.E404) {
        throw viewCall.error;
    }
    const comparison = (0, compare_versions_js_1.compareVersions)(version, viewCall.successData, options);
    const publishCall = comparison.type
        ? await (0, index_js_1.callNpmCli)(index_js_1.PUBLISH, publishArguments, cliOptions)
        : { successData: undefined, errorCode: undefined, error: undefined };
    if (publishCall.error && publishCall.errorCode !== index_js_1.EPUBLISHCONFLICT) {
        throw publishCall.error;
    }
    const { successData: publishData } = publishCall;
    return {
        id: publishData?.id,
        files: publishData?.files ?? [],
        type: publishData ? comparison.type : undefined,
        oldVersion: comparison.oldVersion,
    };
}
exports.compareAndPublish = compareAndPublish;
//# sourceMappingURL=compare-and-publish.js.map