/*global define*/
define(function(require) {
    'use strict';

    var Backbone = require('backbone'),
        _ = require('underscore'),
        SubRoute = require('backbone.subroute'),
        Views = require('./views'),
        Models = require('./models'),
        Collections = require('./collections'),
        Routers = require('./routers'),
        Channels = {},
        Subscribe,
        Publish;

    require('./debug');
    require('./hbs');

    Subscribe = function(channel,object) {
      //We want to be able to push new listeners into Channels[channel]
      if (!Channels[channel]) {
        Channels[channel] = [];
      }
      Channels[channel].push(object);
    };
    Publish = function(channel,options) {
      if (Channels[channel]) {
        var listeners = Channels[channel];
        _.each(listeners, function(listener){
          listener.trigger(channel,options);
        });
      }
    };

    return {
        // Channel events
        Subscribe: Subscribe,
        Publish: Publish,
        Channels: Channels,
        Collection: Collections.Base,
        Collections: Collections,
        Events: Backbone.Events,
        history: Backbone.history,
        Model: Models.Base,
        Models: Models,
        Router: Routers.Base,
        SubRoute: SubRoute,
        View: Views.Base,
        Views: Views
    };
});
