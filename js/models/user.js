var app = app || {};

app.User = Backbone.Model.extend({
    defaults: {
        name: '',
        username: '',
        email: '',
        permissions: [],
        selected: false
    }
});
