var app = app || {};

app.UserView = Backbone.View.extend({
	template: _.template($('#user-list-item-template').html()),
	tagName: 'li',

	events: {
		'click a': 'select'
	},

	initialize: function (options) {

	},

	select: function(e){
		e.stopPropagation();
		Backbone.pubSub.trigger('user:select', this.model);
	},

	edit: function(e){
		var username = this.model.get('loginname');
		app_router.navigate('edit/user/' + username, { trigger: false });
	},

	render: function () {
		this.$el.html(this.template(this.model.toJSON()));
		this.$el.attr('role', 'presentation');

		return this;
	}
});
