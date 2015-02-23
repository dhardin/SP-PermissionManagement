var app = app || {};

app.EditUserPermissionsView = Backbone.View.extend({
	template: _.template($('#user-template').html()),


	events:{
		'click #user-search-button': 'onUserSearchClick'
	},
	
	render: function () {
		this.$el.html(this.template((this.model ? this.model.toJSON() : {})));
		this.$user = this.$('#user');
		this.$permissions = this.$('#permissions');
		 this.$search = this.$('.search');
        this.$users = this.$('#users');

		this.UserEditView = new app.UserEditView({
				el: this.$user[0],
				model: this.model
			});

		this.UserPermissionsView = new app.UserPermissions({
			el: this.$permissions[0],
			model: this.model
		});

		this.UserEditView.render();
		this.UserPermissionsView.render();
		return this;
	}
});
