/*global define*/
define(function(require) {
    'use strict';

    var _ = require('underscore'),
        $ = require('jquery'),
        expect = require('expect'),
        afterEach = require('mocha').afterEach,
        beforeEach = require('mocha').beforeEach,
        describe = require('mocha').describe,
        it = require('mocha').it,
        Handlebars = require('handlebars'),
        Chiropractor = require('chiropractor'),
        Views = require('chiropractor/views');

    return function() {
        afterEach(function() {
            if (this.view) {
                this.view.remove();
            }
        });

        describe('Base', function() {
            var View = Views.Base.extend({
                spy: function() {},
                remove: function() {
                    this.spy();
                    Views.Base.prototype.remove.apply(this, arguments);
                }
            });

            it('should call the remove method when the ' +
               'parent element has its content replaced.', function() {
                   var view = new View(),
                       spy = this.sandbox.spy(view, 'spy');

                   this.dom.append(view.render().el);
                   expect(spy.callCount).to.equal(0);
                   this.dom.html('');
                   expect(spy.callCount).to.equal(1);
               });

            it('should call the remove method when an ' +
               'ancestor of the element has its content replaced.', function() {
                   var content = $('<div><div class="subcontent"></div></div>'),

                       view1 = new View(),
                       view2 = new View(),
                       spy1 = this.sandbox.spy(view1, 'spy'),
                       spy2 = this.sandbox.spy(view2, 'spy');

                   this.dom.append(content);
                   this.dom.find('.subcontent').append(view1.render().el);
                   view1.$el.html(view2.render().el);

                   expect(spy1.callCount).to.equal(0);
                   expect(spy2.callCount).to.equal(0);

                   this.dom.html('');

                   expect(spy1.callCount).to.equal(1);
                   expect(spy2.callCount).to.equal(1);
               });

            it('should allow a template string to be provided as the ' +
               'template attribute.', function() {
                   var View = Views.Base.extend({
                            template: 'string template'
                       });

                   this.view = (new View()).render();

                   expect(this.view.$el.html()).to.equal('string template');
               });

            it('should allow a compiled handlebars template to be ' +
               'provided.', function() {
                   var View = Views.Base.extend({
                           template: Handlebars.compile('compiled')
                       });

                   this.view = (new View()).render();

                   expect(this.view.$el.html()).to.equal('compiled');
               });

            it('should allow for a context function to be defined by ' +
               'subclasses', function() {
                   var View = Views.Base.extend({
                           template: '{{ one }} thing',
                           context: function() {
                               return {
                                   one: 'one'
                               };
                           }
                       });

                   this.view = (new View()).render();

                   expect(this.view.$el.html()).to.equal('one thing');
               });

            it('should allow passing a `context` argument to extend the ' +
               'default context with.', function() {
                   var View = Views.Base.extend({
                        template: 'Test {{ one }} - {{ two }}'
                    });

                   this.view = new View({
                        context: {
                            one: 1,
                            two: 2
                        }
                    });

                   expect(this.view.render().$el.html())
                    .to.equal('Test 1 - 2');
               });
        });

        describe('Form', function() {
            it('should render form errors when the model triggers an invalid ' +
               'event', function() {
                   var model = new Chiropractor.Model();

                   this.view = new (Views.Form.extend({
                       template: '{{ formfield "text" model "field1" }}'
                   }))({model: model}).render();

                   model.parse({
                       data: {},
                       meta: {
                           status: 400,
                           errors: {
                               form: {
                                   '__all__': ['Error 1'],
                                   'field1': ['Error 2'],
                                   'fakeField': ['Error 3']
                               }
                           }
                       }
                   });

                   expect(this.view.$el.html()).to.contain('Error 1');
                   expect(this.view.$el.html()).to.contain('Error 2');
                   expect(this.view.$el.html()).to.not.contain('Error 3');
               });

            it('should clear form errors when the fields change', function() {
                   var model = new (Chiropractor.Model.extend({
                       validation: {
                            field1: {
                                pattern: /^value$/,
                                msg: 'Error 1'
                            },
                            field2: {
                                pattern: /^value$/,
                                msg: 'Error 2'
                            }
                        }
                   }))({field1: 'value', field2: 'value'});

                   this.view = new (Views.Form.extend({
                       template: '{{ formfield "text" model "field1" }}' +
                           '{{ formfield "text" model "field2" }}'
                   }))({model: model}).render();

                   model.validate();

                   expect(this.view.$el.html()).to.not.contain('Error 1');
                   expect(this.view.$el.html()).to.not.contain('Error 2');

                   this.view.$('input[name="field2"]').val('badvalue').change();
                   expect(this.view.$el.html()).to.not.contain('Error 1');
                   expect(this.view.$el.html()).to.contain('Error 2');

                   this.view.$('input[name="field2"]').val('value').change();
                   expect(this.view.$el.html()).to.not.contain('Error 1');
                   expect(this.view.$el.html()).to.not.contain('Error 2');
               });
        });
    };
});
