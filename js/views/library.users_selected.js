var app = app || {};

app.LibraryUsersSelectedView = app.LibraryView.extend({
	template: _.template($('#collection-template').html()),

	initialize: function (options){
		Backbone.pubSub.on('library_users_selected:search', this.search, this);
		app.LibraryView.prototype.initialize.apply(this, [options]); 
	}
});