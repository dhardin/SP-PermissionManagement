var app = app || {};

app.Group = Backbone.Model.extend({
    defaults: {
       name: '',
       users: [],
       selected: false,
       active: true
    }
});
