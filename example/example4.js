/*global define*/
define(function (require) {
  'use strict';

  var Backbone = require('backbone'),
    JSON = require('json-ie7'),
    SubRoute = require('backbone.subroute'),
    Views = require('src/views'),
    Models = require('src/models'),
    Collections = require('src/collections'),
    Routers = require('src/routers'),
    Handlebars = require('handlebars'),
    template = require('hbs!./../example/templates/example4'),
    Data = require('example/data'),
    Field = Views.Field,
    ModelConstructor,
    Model,
    CollectionConstructor,
    Collection,
    Fields,
    Page;

  Fields = [{
    id: '',
    name: 'disable?',
    fieldtype: 'checkbox'
  }, {
    id: 'name',
    name: 'Name',
    fieldtype: 'customfield'
  }, {
    id: 'description',
    name: 'Description'
  }];

  ModelConstructor = Models.Base.extend({
    url: "http://rodin-admin.cloud.wiser-ci.com/api/v1/topics/topic/company/ge"
  });

  Model = new ModelConstructor({});

  Model.fetch().done(function () {
    Page = document.getElementById('page-layout');
    if (window.XDomainRequest) {
      // If ie7 then do this
      window.setTimeout(function () {
        Page.innerHTML = Page.innerHTML + template({
          model: Model,
          fields: Fields
        });
      }, 10);
    } else {
      // other browsers do this
      Page.innerHTML = Page.innerHTML + template({
        model: Model,
        fields: Fields
      });
    }
    console.log(Model);
    Model.save();

  });

});