var app = app || {};

app.LibraryPermissionsAvailableView = app.LibraryView.extend({
	template: _.template($('#collection-template').html()),

	initialize: function (options){
		Backbone.pubSub.on('library_permissions_available:search', this.search, this);
			app.LibraryView.prototype.initialize.apply(this, [options]); 
	}
});