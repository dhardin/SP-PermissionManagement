var app = app || {};

var Router = Backbone.Router.extend({
	routes: {
		'': 'main',
		'permissions': 'main',
		'permissions/user': 'editUser',
		'permissions/user/:name': 'editUser',
		'permissions/group': 'editGroup',
		'permissions/group/:name': 'editGroup',
		'permissions/*': 'main'
	},

	 initialize: function(options){
	    this.AppView = options.AppView;
	  },
	
	main: function  () {
		var mainView = new app.mainView();
		   this.AppView.showView(mainView);
	},

	editUser: function(name){

		var editUserView = new app.EditUserView({username: name});
		
 		this.AppView.showView(editUserView);
		
		//var chartEditView = new app.ChartEditView({model: chart});
		//this.AppView.showView(chartEditView);
	},

	editGroup: function(name){

		var editGroupView = new app.EditGroupView({groupname: name});
		
 		this.AppView.showView(editGroupView);
		
		//var chartEditView = new app.ChartEditView({model: chart});
		//this.AppView.showView(chartEditView);
	}
});


var app_router = new Router({AppView: app.AppView});

Backbone.history.start();
