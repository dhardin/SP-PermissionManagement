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
	   if(app.state_map.fetchingData){ 
			var fetchingDataView =  new app.FetchingDataView();
		   	this.AppView.showView(fetchingDataView);
			app.state_map.fetchId= username;
			app.router = this;
			app.state_map.dataLoadCallback = function(){
				var user = (app.fetchId && app.UserCollection.get({username: app.state_map.fetchId}) ? 
					app.UserCollection.get({username: app.state_map.fetchId})
					: new app.User()),
				    editUserPermissionView = new app.EditUserPermissionsView({model: user});
 				app.router.AppView.showView(editItemView);
			};
		} else {
			var editUserPermissionView = new app.EditUserPermissionsView({model: new app.User()});
  			this.AppView.showView(editUserPermissionView);
		}
	}

});


var app_router = new Router({AppView: app.AppView});

Backbone.history.start();
