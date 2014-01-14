/*global define*/
define(function (require) {
  'use strict';
  require('chiropractor-path/jquery.cors/jquery.cors');

  var Backbone = require('backbone'),
    _ = require('underscore'),
    Base,
    $ = require('jquery'),
    TemplateError = require('hbs!./views/templates/error/modelfetch');

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
      default:
      }
      return Backbone.Collection.prototype.sync.call(
        this, method, model, options
      );
    }
  });

  return {
    Base: Base
  };
});