Chiropractor
============

[![Build
Status](https://travis-ci.org/WiserTogether/chiropractor.png?branch=master)](https://travis-ci.org/WiserTogether/chiropractor)

Straighten out your Backbone.js

Usage
-----

For the time being we are not bundling all of the dependencies for this module
into the `chiropractor.js` file, instead you will need to define those
dependencies yourself. You can reference the `bower.json` file to get a list
of all of the dependencies (both development and production) or reference
`build.js` to see what the bare minimum requirejs configuration file looks like
to support this module.

```
require.config({
    paths: {
        'chiropractor':       'bower_components/chiropractor/chiropractor',
        'handlebars':         'bower_components/require-handlebars-plugin/Handlebars',
        'hbs':                'bower_components/require-handlebars-plugin/hbs',
        'i18nprecompile':     'bower_components/require-handlebars-plugin/hbs/i18nprecompile',
        'json2':              'bower_components/require-handlebars-plugin/hbs/json2',
        'underscore':         'bower_components/underscore/underscore',
        'jquery':             'bower_components/jquery/jquery',
        'jquery.cookie':      'bower_components/jquery.cookie/jquery.cookie'
    },

    hbs: {
        disableI18n: true,
        disableHelpers: true
    },

    pragmasOnSave: {
        excludeHbsParser : true,
        excludeHbs: true,
        excludeAfterBuild: true
    },

    shim: {
        'underscore': {
            exports: '_'
        },
        'jquery.cookie': {
            deps: ['jquery'],
            exports: 'jQuery.cookie'
        }
    }
});
```

Building
--------

To get started developing Chiropractor you must first run two commands to
install all of the dependencies:

    npm install
    bower install

In order to compile the Chiropractor code for release you must run:

    grunt

Which will generate `chiropractor.js` as well as `chiropractor.min.js` in the
root of the project. Whenever you wish to run this command, please be sure to
increment the version defined in `package.json` as well as `bower.json`.

Tests
-----

There are two ways to run tests:

    npm test

Or if you want more control over how your tests are run (such as continuous
testing with auto-running tests on file changes you can run:

    ./node_modules/.bin/karma start --dev --browsers Chrome,PhantomJS

Previewing
-----

You can preview example functionality of Chiropractor by first running:

    grunt devserver


goto: http://localhost:8888

Also you check out the /example folder for the source code of these examples
in how to integrate Chiropractor into your project.

Enabling ErrorHandling
-----

You can enable Chiropractor default error handler for api unreachable or error
codes by setting the property: enableErrorHandler: true in your model or collection.

You can also override or create your own custom error template by overriding the row "error" template with your own.

Setting up EasyXDM and jquery.cors
------

Installation:

* Add these paths:

```
'chiropractor-path': '../components/chiropractor',
'jquery.cors': '../components/chiropractor/jquery.cors',
```

* add shim values

```
  shim: {
    'json2': { exports: 'JSON' },
    'console-shim': { exports: 'console' }
  }
});
```