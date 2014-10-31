var app = app || {};

app.ChartView = Backbone.View.extend({
	template: _.template($('#chart-list-item-template').html()),

	events: {
		'click #editChartBtn': 'editChart',
		'mouseup': 'editChart',
		'click #deleteChartBtn': 'deleteChart',
		'drop': 'onSortChange'
	},

	initialize: function (options) {

	},

	editChart: function(e){
		var cid = this.model.cid;
		app_router.navigate('edit/' + cid, { trigger: true });
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
