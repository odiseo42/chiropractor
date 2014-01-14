/**
 * jquery.cors
 *
 * Implements CORS functionality for browsers supporting it natively with an automatic
 * fallback to easyXDM which implements cors via an embedded iframe or swf. To use it,
 * you must do two things:
 *
 * 1. Include the jquery plugin and use jquery.ajax calls as usual.
 * 2. Make jquery.cors available via require.js:
 * shim: {
 *   'jquery.cors/easyxdm/easyxdm': { exports: 'easyXDM' },
 * }
 * paths: {
 *   'jquery.cors':          'lib/jquery.cors/0.1',   // shim all paths
 * }
 * 3. Adjust jquery_cors_path to match the location where jquery.easyxdm.provider.js
 * 4. Adjust jquery.easyxdm.provider.js to allow calls from the domains needing CORS
 * 5. Adjust server to apply CORS headers for domains that should be able to. For
 *    Allow-Credentials to work properly, the server must dynamically set the Allow-Origin
 *    to match the Origin: from the request, you cannot simply use *
 *
 *    Access-Control-Allow-Credentials: true
 *    Access-Control-Allow-Origin: https://localhost:2443
 *    Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
 *    Access-Control-Allow-Headers: x-requested-with, content-type, accept, origin, authorization
 *
 */
define(function (require) {
    "use strict";
    var _ = require('underscore'),
        $ = window.$ || require('jquery'),
        JSON = require('json2'),
        console = require('console-shim'),
        easyXDM = require('easyxdm'),
        jquery_cors_path = '/static-optimized/js/lib/jquery.cors/0.1/',
        easyXDM_path = jquery_cors_path + '/easyxdm/',
        easyXDM_connections = {},
        jquery_cors = {};
        // $.support.cors = false;

    /**
     * Configure jQuery for CrossDomain CORS requests
     */
    $.ajaxSetup({
        xhrFields: {
            withCredentials: true
        }
    });

    /**
     * register a custom ajaxTransport, per
     * http://api.jquery.com/jQuery.ajaxTransport/
     */
     $.ajaxTransport("+*", function (options, originalOptions, jqXHR) {
        if (options.crossDomain && !$.support.cors) {
            var provider_base_url = "",
                regexp_results = options.url.match(/^(https?:\/\/[^\/]*)\/?.*/);
            if (regexp_results) {
                provider_base_url = regexp_results[1];
            }

            if (!easyXDM_connections.hasOwnProperty(provider_base_url)) {
                console.log('creating easyXDM pool entry for ' + provider_base_url);
                easyXDM_connections[provider_base_url] = {
                    callbackQueue: [],
                    connection: undefined,
                    error: undefined,
                    state: "before"
                }
            }
            console.log('jquery.cors easyXDM request for ' + options.url + ' using ' + provider_base_url);

            return provider_base_url === "" ? null : {
                send: function (headers, completeCallback) {
                    jquery_cors.getConnection(provider_base_url, {
                        'success': function (easyXDM_connection) {
                            function continuation_proxy(results) {
                                console.log('easyXDM connection for ' + options.url + ' via ' + provider_base_url + ' continuation proxy excecuting')
                                completeCallback(results.status,
                                    results.statusText,
                                    results.responses,
                                    results.headers
                                    );
                            }
                            originalOptions.context = null;
                            easyXDM_connection.jquery_proxy(originalOptions, continuation_proxy);
                            console.log('easyXDM connection for ' + options.url + ' via ' + provider_base_url + ' initialized')
                        },
                        'error': function () {
                            console.log('easyXDM connection for ' + provider_base_url + ' failed to initialize');
                        }
                    });
                },
                'abort': function () {
                    console.log('easyXDM connection for ' + provider_base_url + ' aborted');
                }
            };
        }
    });

    jquery_cors.doRequests = function (provider_base_url, callbacks) {
        var scoped_easyXDM = easyXDM.noConflict("jquery_easyXDM" + provider_base_url),
            remote_url = provider_base_url + jquery_cors_path + "jquery.easyxdm.provider.html";

        console.log('doRequests for ' + provider_base_url);

        jquery_cors.easyXDM = scoped_easyXDM;
        easyXDM_connections[provider_base_url]['connection'] = new jquery_cors.easyXDM.Rpc(
            {
                channel: provider_base_url,
                remote: remote_url,
                swf: provider_base_url + easyXDM_path + "easyxdm.swf",
                onReady: function () {
                    callbacks.success(easyXDM_connections[provider_base_url]['connection']);
                }
            },
            { remote: { jquery_proxy: function() { console.log('jquery_proxy'); }}}
        );
    };

    jquery_cors.getConnection = function (provider_base_url, callbacks) {
        var i;

        switch (easyXDM_connections[provider_base_url]['state']) {
            case "before":
                console.log('before: ' + provider_base_url);
                easyXDM_connections[provider_base_url]['state'] = "working";
                easyXDM_connections[provider_base_url]['callbackQueue'].push(callbacks);
                jquery_cors.doRequests(provider_base_url,{
                    'success': function (singletonInstance) {
                        console.log('doRequests.success for ' + provider_base_url);
                        easyXDM_connections[provider_base_url]['state'] = "success";
                        easyXDM_connections[provider_base_url]['connection'] = singletonInstance;
                        for (i = 0; i < easyXDM_connections[provider_base_url]['callbackQueue'].length; i++) {
                            easyXDM_connections[provider_base_url]['callbackQueue'][i].success(easyXDM_connections[provider_base_url]['connection']);
                        }
                        easyXDM_connections[provider_base_url]['callbackQueue'] = [];
                    },
                    'failure': function (errorObj) {
                        console.log('doRequests.failure for ' + provider_base_url);
                        easyXDM_connections[provider_base_url]['state'] = "failure";
                        easyXDM_connections[provider_base_url]['error'] = errorObj;
                        for (i = 0; i < easyXDM_connections[provider_base_url]['callbackQueue'].length; i++) {
                            easyXDM_connections[provider_base_url]['callbackQueue'][i].failure(errorObj);
                        }
                        easyXDM_connections[provider_base_url]['callbackQueue'] = [];
                    }
                });
            break;
        case "working":
            console.log('working: ' + provider_base_url);
            easyXDM_connections[provider_base_url]['callbackQueue'].push(callbacks);
            break;
        case "success":
            console.log('success: ' + provider_base_url);
            callbacks.success(easyXDM_connections[provider_base_url]['connection']);
            break;
        case "failure":
            console.log('failure: ' + provider_base_url);
            callbacks.failure(easyXDM_connections[provider_base_url]['error']);
            break;
        default:
            console.log('invalid state: ' + provider_base_url);
            throw new Error("Invalid state: " + easyXDM_connections[provider_base_url]['state']);
        }
    };
    window.$ = $;
    window.jquery_cors = jquery_cors;
    return jquery_cors;
});