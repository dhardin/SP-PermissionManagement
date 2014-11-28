var app = app || {};

app.UserView = Backbone.View.extend({
	template: _.template($('#user-list-item-template').html()),
	tagName: 'li',

	events: {
		'click': 'select'
	},

	initialize: function (options) {

	},

	select: function(e){
		 Backbone.pubSub.trigger('user:select', this.model);
	},

	edit: function(e){
		var username = this.model.username;
		app_router.navigate('edit/' + username, { trigger: false });
		//package collection as strinified array
		//save();
	},

	render: function () {
		this.$el.html(this.template(this.model.toJSON()));
		this.$el.attr('role', 'presentation');

		return this;
	}
});
