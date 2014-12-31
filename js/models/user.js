var app = app || {};

app.User = Backbone.Model.extend({
    defaults: {
        name: '',
        loginname: '',
        email: '',
        id: '',
        permissions: [],
        selected: false,
        active: true
    }
});
