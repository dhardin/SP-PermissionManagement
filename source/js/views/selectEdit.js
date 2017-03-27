var app = app || {};

app.SelectEditView = Backbone.View.extend({
	template: _.template($('#main-template').html()),
	
	render: function () {
		this.$el.html(this.template());
		
		return this;
	}
});
