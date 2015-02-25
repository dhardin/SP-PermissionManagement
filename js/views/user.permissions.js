var app = app || {};

app.EditUserPermissionsView = Backbone.View.extend({
	template: _.template($('#user-template').html()),


	events:{
		'click #user-search-button': 'onUserSearchClick'
	},
	initialize: function(){
		this.childViews = [];
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
		this.childViews.push(this.UserEditView);
		this.childViews.push(this.UserPermissionsView);
		return this;
	},
    onClose: function(){
        _.each(this.childViews, function(childView){
            childView.remove();
            childView.unbind();
            if(childView.onClose){
                childView.onClose();
            }
        });
    }
});
