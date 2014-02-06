/*global define,setTimeout,clearTimeout*/
define(function (require) {
  'use strict';

  require('jquery.cors/jquery.cors');


  var Backbone = require('backbone'),
    _ = require('underscore'),
    JSON = require('json-ie7'),
    $ = require('jquery'),
    auth = require('./models/auth'),
    BackboneDeepModel = require('backbone.deep.model'),
    Validation = require('backbone.validation'),
    TemplateError = require('hbs!./views/templates/error/modelfetch'),
    Base,
    Revision,
    UserAgent,
    RegExpression,
    ASSETS_BASE_URL;

  // Add Wiser specific settings Issue #31

  if(window && window.Wiser && window.Wiser.ASSETS_BASE_URL) {
    ASSETS_BASE_URL = window.Wiser.ASSETS_BASE_URL;
  } else {
    ASSETS_BASE_URL = '';
  }

  require('underscore.mixin.deepextend');

  Base = BackboneDeepModel.DeepModel.extend({
    errorHandler: function(response) {
      var errorMessage;
      switch(response.status) {
        case 0:
          errorMessage = "The API was unreachable";
          break;
        case 503:
          errorMessage = "There was an Error Communicating with the API";
          break;
          default:
      }
      $('body').before(TemplateError({ url: this.url ,  errorMessage: errorMessage, response: response }));
    },
    successHandler: function(model, response, options) {
    },
    sync: function (method, model, options) {
      // Setup the authentication handlers for the BaseModel
      //

      auth.sync.call(this, method, model, options);
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
      return Backbone.Model.prototype.sync.call(
        this, method, model, options
      );
    },
    parse: function (resp, options) {
      options = options || {};
      // We need to unwrap the old WiserTogether API envelop format.
      if (resp.data && resp.meta) {
        if (parseInt(resp.meta.status, 10) >= 400) {
          options.legacyError = true;
          if (resp.meta.errors && resp.meta.errors.form) {
            this.validationError = resp.meta.errors.form;
            this.trigger(
              'invalid',
              this,
              this.validationError,
              _.extend(options || {}, {
                validationError: this.validationError
              })
            );
          } else {
            this.trigger('error', this, resp.data, options);

            if (options.error) {
              options.error(this, resp.data, options);

            }
          }
          // We do not want an error response to update the model
          // attributes (returning an empty object leaves the model
          // state as it was
          return {};
        }

        // Add Wiser specific settings Issue #31
        resp.Wiser = {};
        resp.Wiser.ASSETS_BASE_URL = ASSETS_BASE_URL;

        return resp.data;
      }

      // Add Wiser specific settings Issue #31
      resp.Wiser = {};
      resp.Wiser.ASSETS_BASE_URL = ASSETS_BASE_URL;

      return Backbone.Model.prototype.parse.apply(this, arguments);
    },

    fieldId: function (field, prefix) {
      prefix = prefix || 'formfield';
      return [prefix, field, this.cid].join('-');
    },

    set: function (attrs, options) {
      // We need to allow the legacy errors to short circuit the Backbone
      // success handler in the case of a legacy server error.
      if (options && options.legacyError) {
        delete options.legacyError;
        return false;
      }
      return BackboneDeepModel.DeepModel.prototype.set.apply(this, arguments);
    }
  });

  _.extend(Base.prototype, Validation.mixin);

  return {
    Base: Base,
    cleanup: auth.cleanup
  };
});