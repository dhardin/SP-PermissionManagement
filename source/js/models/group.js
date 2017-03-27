var app = app || {};

app.Group = Backbone.Model.extend({
    defaults: {
       name: '',
       id:'',
       description:'',
       users: [],
       selected: false,
       active: true,
       rank: 0
    }
});
