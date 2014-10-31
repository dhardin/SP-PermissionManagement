var app = app || {};

app.Group = Backbone.Model.extend({
    defaults: {
       name: '',
       selected: false
    }
});
