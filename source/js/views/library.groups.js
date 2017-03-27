var app = app || {};

app.LibraryGroupView = app.LibraryView.extend({
	template: _.template($('#collection-template').html()),

	initialize: function (options){
		Backbone.pubSub.on('library_groups:search', this.search, this);
		app.LibraryView.prototype.initialize.apply(this, [options]); 
	}
});