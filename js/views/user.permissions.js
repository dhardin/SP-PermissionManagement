var app = app || {};

app.EditUserPermissionsView = Backbone.View.extend({
	template: _.template($('#user-template').html()),

	events:{

	},

	initialize: function(){
	},

	render: function () {
		this.$el.html(this.template((this.model ? this.model.toJSON() : {})));
		this.$user = this.$('#user');
		this.$permissions = this.$('#permissions');

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
