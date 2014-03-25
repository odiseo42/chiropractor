/*global define,setTimeout,clearTimeout*/
define(function (require) {
  'use strict';

    var $ = require('jquery'),
        easyXDM = require('easyXDM'),
        jquery_easyXDM = window.jquery_easyXDM || {},
        scoped_easyXDM = easyXDM.noConflict("jquery_easyXDM"),
        remote;

    jquery_easyXDM.easyXDM = scoped_easyXDM;
    remote = new scoped_easyXDM.Rpc({
        local: "./easyxdm/name.html",
        swf:   "./easyxdm/easyxdm.swf"
    }, {
        local: {
            // define the exposed method
            jquery_proxy: function (config, continuation_proxy) {
                // this file is by default set up to use Access Control - this means
                // that it will use the headers set by the server to decide whether
                // or not to allow the call to return
                var useAccessControl = true,
                    alwaysTrusted = false,
                    alwaysTrustedOrigins = [
                        'https://localhost:2443',
                        'https://wiser-local.com:2443',
                        'https://wiser-local.com',
                        'https://wiser-dev.com',
                        'https://wiser-tst.com',
                        'https://wiser-stg.com',
                        'https://wiser-prd.com',
                        'https://mywiserhealth.com',
                        'https://healthactionlab.com',
                        'https://dev.wsrcdn.net.s3.amazonaws.com',
                        'https://dev.wsrcdn.net',
                        'https://b.wsrcdn.net',
                        'https://b.wsrcdn.net.s3.amazonaws.com',
                        'https://beta.wiser-dev.com',
                        'https://beta.wiser-tst.com',
                        'https://cms.wiser-dev.com',
                        'https://cms.wiser-tst.com',
                        'https://cms.mywiserhealth.com'
                    ], // exact strings or regular expressions
                    i = 0;

                // check if this origin should always be trusted
                i = alwaysTrustedOrigins.length;
                while (i-- && !alwaysTrusted) {
                    if (alwaysTrustedOrigins[i] instanceof RegExp) {
                        alwaysTrusted = alwaysTrustedOrigins[i].test(remote.origin);
                    } else if (typeof alwaysTrustedOrigins[i] === "string") {
                        alwaysTrusted = (remote.origin === alwaysTrustedOrigins[i]);
                    }
                }
                // By definition easyXDM is used when crossDomain is not supported,
                // and easyXDM transforms the crossDomain request into a regular request
                // inside an embedded iframe.
                // This request is now inside the embedded iframe, and is therefore
                // by definition no longer a crossDomain request.
                config.crossDomain = false;
                if (typeof (config.xhrFields) === "object") {
                    // The withCredentials attribute is not supported in IE <= 7
                    // (causes a native xhr exception if set), and it's not needed for
                    // this non-crossDomain request anyway.
                    delete config.xhrFields.withCredentials;
                }
                if (!config.hasOwnProperty('headers')) {
                    config.headers = {};
                }
                config.headers['X-Origin'] = remote.origin;

                $.ajax(config).done(function (data, textStatus, jqXHR) {
                    // parse the response headers
                    var aclAllowedOrigin,
                        aclAllowedMethods,
                        errorMessage = false,
                        headers = {},
                        headers_lowercase = {},
                        m,
                        rawHeaders = jqXHR.getAllResponseHeaders(),
                        reHeader = /([\w-_]+):\s+(.*)$/gm,
                        result;

                    while ((m = reHeader.exec(rawHeaders))) {
                        headers_lowercase[m[1].toLowerCase()] = headers[m[1]] = m[2];
                    }

                    if (useAccessControl) {
                        // normalize access control headers
                        aclAllowedOrigin = (
                            headers_lowercase["access-control-allow-origin"] || ""
                            ).replace(/\s/g, "");
                        aclAllowedMethods = (
                            headers_lowercase["access-control-allow-methods"] || "OPTIONS,GET,POST,PUT"
                            ).replace(/\s/g, "");

                        // determine if origin is trusted
                        if (alwaysTrusted || aclAllowedOrigin === "*" || aclAllowedOrigin.indexOf(remote.origin) !== -1) {
                            // determine if the request method was allowed
                            if (aclAllowedMethods && aclAllowedMethods !== "*" && aclAllowedMethods.indexOf(config.type) === -1) {
                                errorMessage = "DISALLOWED_REQUEST_METHOD: " + config.type;
                            }
                        } else {
                            errorMessage = "DISALLOWED_ORIGIN: " + remote.origin;
                        }
                    }
                    if (errorMessage) {
                        result = {
                            status:     405,
                            statusText: errorMessage,
                            responses:  {
                                errorMessage: errorMessage
                            },
                            headers:    {}
                        };
                        alert(errorMessage);
                    } else {
                        result = {
                            status:     jqXHR.status,
                            statusText: jqXHR.statusText,
                            responses:  {},
                            headers:    jqXHR.getAllResponseHeaders()
                        };
                        if (jqXHR.responseText) {
                            result.responses.text = jqXHR.responseText;
                        }
                        if (jqXHR.responseXml) {
                            result.responses.xml = jqXHR.responseXml;
                        }
                    }
                    continuation_proxy(result);
                }).fail(function (jqXHR, textStatus, errorMessage) {
                        var result = {
                            status:     jqXHR.status,
                            statusText: jqXHR.statusText,
                            responses:  {},
                            headers:    jqXHR.getAllResponseHeaders()
                        };
                        if (jqXHR.responseText) {
                            result.responses.text = jqXHR.responseText;
                        }
                        if (jqXHR.responseXml) {
                            result.responses.xml = jqXHR.responseXml;
                        }
                        continuation_proxy(result);
                });
            }
        }
    });
    window.jquery_easyXDM = jquery_easyXDM;
    return window.jquery_easyXDM;
});
