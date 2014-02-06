/*global define*/
define(function (require) {
  'use strict';

  require('jquery.cors/jquery.cors');


  var Backbone = require('backbone'),
    _ = require('underscore'),
    Base,
    $ = require('jquery'),
    TemplateError = require('hbs!./views/templates/error/modelfetch'),
    ASSETS_BASE_URL;

  // Add Wiser specific settings Issue #31

  if(window && window.Wiser && window.Wiser.ASSETS_BASE_URL) {
    ASSETS_BASE_URL = window.Wiser.ASSETS_BASE_URL;
  } else {
    ASSETS_BASE_URL = '';
  }

  require('underscore.mixin.deepextend');

  Base = Backbone.Collection.extend({
    errorHandler: function (response) {
      var errorMessage;
      switch (response.status) {
      case 0:
        errorMessage = "The API was unreachable";
        break;
      case 503:
        errorMessage = "There was an Error Communicating with the API";
        break;
      default:
      }
      $('body').before(TemplateError({
        url: this.url,
        errorMessage: errorMessage,
        response: response
      }));
    },
    sync: function (method, model, options) {
      switch (method) {
      case 'read':
        //Empty the error message box for other fetches
        $('#chiropractor-error-box').empty();
        if (this.enableErrorHandler) {
          options.error = this.errorHandler;
          // Timeout set to 30 seconds.
          options.timeout = 30000;
        }
        break;
      case 'update':
        // Remove Wiser specific settings Issue #31
        model.unset('Wiser');
        break;
      default:
      }
      return Backbone.Collection.prototype.sync.call(
        this, method, model, options
      );
    },
    parse: function (resp, options) {
      // Add Wiser specific settings Issue #31
      resp.Wiser = {};
      resp.Wiser.ASSETS_BASE_URL = ASSETS_BASE_URL;
      return Backbone.Collection.prototype.parse.apply(this, arguments);
    }
  });

  return {
    Base: Base
  };
});