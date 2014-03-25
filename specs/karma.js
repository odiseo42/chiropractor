require.config({
    packages: [
        {name: "chiropractor", location: "src"}
    ],

    baseUrl: '/base',

    hbs: {
        disableI18n: true,
        disableHelpers: true
    },

    paths: {
        // Application Dependencies
        'handlebars':           'bower_components/require-handlebars-plugin/Handlebars',
        'hbs':                  'bower_components/require-handlebars-plugin/hbs',
        'i18nprecompile':       'bower_components/require-handlebars-plugin/hbs/i18nprecompile',
        'text':                 'bower_components/requirejs-plugins/lib/text',
        'json':                 'bower_components/requirejs-plugins/src/json',
        'json2':                'bower_components/require-handlebars-plugin/hbs/json2',
        'json3':                'bower_components/json3/lib/json3',
        'underscore':           'bower_components/underscore/underscore',
        'backbone':             'bower_components/backbone-amd/backbone',
        'jquery':               'bower_components/jquery/jquery',
        'jquery.cookie':        'bower_components/jquery.cookie/jquery.cookie',
        'backbone.subroute':    'bower_components/backbone.subroute/backbone.subroute',
        'backbone.validation':  'bower_components/backbone-validation/dist/backbone-validation-amd',
        'backbone.deep.model': 'bower_components/backbone-deep-model/distribution/deep-model',
        'underscore.mixin.deepextend': 'lib/underscore.mixin.deepextend',
        'json-ie7': './lib/JSON',
        'jquery.ie.cors':         './lib/jquery.ie.cors',
        'console-shim': 'bower_components/console-shim/console-shim',
        'chiropractor-path': './../',
        // Testing Dependencies
        'sinon':                'bower_components/sinonjs/sinon',
        'es5-shim':             'bower_components/es5-shim/es5-shim',
        'chai':                 'bower_components/chai/chai',
        'expectjs':             'bower_components/expect/expect',
        'expect':               'lib/expect',
        'mocha':                'lib/mocha',
        'browser':              'lib/browser'
    },

    pragmasOnSave: {
        excludeHbsParser : true,
        excludeHbs: true,
        excludeAfterBuild: true
    },

    // Shims are used to set dependencies for third-party modules which
    // do not require their dependencies. first-party modules and forks
    // should not require entries in shims, as they should be able to
    // use define() or require() as appropriate to ensure all their
    // dependencies are available
    shim: {
        // Application Shims
        'backbone': {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
         'backbone.deep.model': {
            deps: ['underscore.mixin.deepextend', 'backbone', 'underscore'],
            exports: 'Backbone.DeepModel'
        },
        'json-ie7': {
          exports: 'JSON'
        },
        'console-shim': {
          exports: 'console'
        },
        'json2': { exports: 'JSON' },
        'jquery.ie.cors': {
          deps: ['jquery']
        },
        'jquery.cookie': {
            deps: ['jquery'],
            exports: 'jQuery.cookie'
        },
        // Testing Shims
        expectjs: {
            exports: 'expect'
        },
        'sinon': {
            exports: 'sinon',
        },
        chai: {
            deps: ['es5-shim']
        }
    },
    deps: [
        'jquery',
        'jquery.ie.cors',
        'hbs',
        'underscore'
    ],
    enforceDefine: true
});

require([
    'require',
    'specs/setup/mocha',
    'specs/main'
], function(require, mochaSetup, testSuite) {
    mochaSetup();
    testSuite();
    window.__karma__.start();
});
