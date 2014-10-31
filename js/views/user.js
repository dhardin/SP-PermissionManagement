var app = app || {};

app.UserView = Backbone.View.extend({
	template: _.template($('#user-list-item-template').html()),

	events: {
		'click #select': 'select',
		'mouseup': 'edit',
		'click #deleteChartBtn': 'deleteChart',
		'drop': 'onSortChange'
	},

	initialize: function (options) {

	},

	select: function(e){
		this.$item.addClass('active');
	}

	edit: function(e){
		var username = this.model.username;
		app_router.navigate('edit/' + username, { trigger: false });
		//package collection as strinified array
		//save();
	},

	deleteChart: function(e) {
		// Delete model
		this.model.destroy();
		// Delete view
		this.remove();

	//	save();
	},

	onSortChange: function (e, index) {
		this.$el.trigger('update-sort', [this.model, index]);
	},

	render: function () {
		this.$el.html(this.template(this.model.toJSON()));

		return this;
	}
});
