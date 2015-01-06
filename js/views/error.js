var app = app || {};

app.ErrorView = Backbone.View.extend({
	template: _.template($('#errorTemplate').html()),
	
	render: function () {
		this.$el.html(this.template());
		
		return this;
	}
});
