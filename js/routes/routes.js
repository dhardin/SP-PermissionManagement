var app = app || {};

var Router = Backbone.Router.extend({
	routes: {
		'': 'editUser',
		'edit/:username': 'editUser',
		'edit/*': 'editUser',
	},

	 initialize: function(options){
	    this.AppView = options.AppView;
	  },
	
	editUser: function  (username) {
		var editUserPermissionView = new app.EditUserPermissionsView({model: new app.User()});
		   this.AppView.showView(editUserPermissionView);
	}

});


var app_router = new Router({AppView: app.AppView});

Backbone.history.start();
