var app = app || {};

var Router = Backbone.Router.extend({
	routes: {
		'': 'editUser',
		'edit/:loginname': 'editUser',
		'edit/*': 'editUser',
	},

	 initialize: function(options){
	    this.AppView = options.AppView;
	  },
	
	editUser: function  (loginname) {
			app.state_map.fetchId = loginname.replace('\\', '/');
	   if(app.state_map.fetchingData){ 
			var fetchingDataView =  new app.FetchingDataView();
		   	this.AppView.showView(fetchingDataView);
		
			app.state_map.dataLoadCallback = function(){
				var user = (app.state_map.fetchId && app.UserCollection.findWhere({loginname: app.state_map.fetchId}) ? 
					app.UserCollection.findWhere({loginname: app.state_map.fetchId})
					: new app.User()),
				    editUserPermissionView = new app.EditUserPermissionsView({model: user});
 				app.router.AppView.showView(editUserPermissionView);
			};
		} else if(loginname) {
			var user = (app.UserCollection.findWhere({loginname: 	app.state_map.fetchId}) ? 
				app.UserCollection.findWhere({loginname: 	app.state_map.fetchId})
				: new app.User()),
			    editUserPermissionView = new app.EditUserPermissionsView({model: user});
				app.router.AppView.showView(editUserPermissionView);
		} else{
			var editUserPermissionView = new app.EditUserPermissionsView({model: new app.User()});
  			this.AppView.showView(editUserPermissionView);
		}
	}

});


app.router = new Router({AppView: app.AppView});

Backbone.history.start();
