var app = app || {};

app.GroupView = Backbone.View.extend({
	template: _.template($('#group-list-item-template').html()),

	events: {
		'click': 'select'
	},

	initialize: function (options) {

	},
	select: function(e){
		var selected = this.model.get('selected');
		if(selected){
			this.$el.find('a').removeClass('selected');
		} else {
			this.$el.find('a').addClass('selected');
		}
		this.model.set('selected', !selected);
	},
	
	render: function () {
		this.$el.html(this.template(this.model.toJSON()));

		return this;
	}
});
