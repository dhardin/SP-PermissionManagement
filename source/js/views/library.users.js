var app = app || {};

app.LibraryUserView = app.LibraryView.extend({
	template: _.template($('#collection-template').html()),

	initialize: function (options){
		Backbone.pubSub.on('library_users:search', this.search, this);
		app.LibraryView.prototype.initialize.apply(this, [options]); 
		
	}
});