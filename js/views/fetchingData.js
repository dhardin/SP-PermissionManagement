var app = app || {};

app.FetchingDataView = Backbone.View.extend({
	template: _.template($('#fetchingDataTemplate').html()),

	initialize: function (options) {

	},
	render: function () {
		this.$el.html(this.template());
		
		return this;
	}
});
