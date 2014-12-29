var app = app || {};

app.LibraryPermissionsSelectedView = app.LibraryView.extend({
	template: _.template($('#collection-template').html()),

	initialize: function (options){
		Backbone.pubSub.on('library_permissions_selected:search', this.search, this);
		app.LibraryView.prototype.initialize.apply(this, [options]); 
	}
});