var app = app || {};

app.LibraryUsersAvailableView = app.LibraryView.extend({
	template: _.template($('#collection-template').html()),

	initialize: function (options){
		Backbone.pubSub.on('library_users_available:search', this.search, this);
		app.LibraryView.prototype.initialize.apply(this, [options]); 
		Backbone.pubSub.on('group:save-users', this.reset, this);
	}
});