var app = app || {};

app.GroupSelectView = Backbone.View.extend({
	template: _.template($('#group-select-list-item-template').html()),
	tagName: 'li',

	events: {
		'click': 'select'
	},

	initialize: function (options) {

	},

	select: function(e){
		e.stopPropagation();
		 Backbone.pubSub.trigger('group:select', this.model);
	},

	edit: function(e){
		var name = this.model.get('name');
		app_router.navigate('edit/group/' + name, { trigger: false });
	},

	render: function () {
		this.$el.html(this.template(this.model.toJSON()));
		this.$el.attr('role', 'presentation');

		return this;
	}
});
