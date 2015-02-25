var app = app || {};

app.EditGroupUsersView = Backbone.View.extend({
    template: _.template($('#group-template').html()),
    initialize: function() {
            this.childViews = [];
    },
    render: function() {
        this.$el.html(this.template((this.model ? this.model.toJSON() : {})));
        this.$group = this.$('#group');
        this.$users = this.$('#user-select');

        this.GroupEditView = new app.GroupEditView({
            el: this.$group[0],
            model: this.model
        });

        this.GroupUsersView = new app.GroupUsers({
            el: this.$users[0],
            model: this.model
        });

        this.GroupEditView.render();
        this.GroupUsersView.render();
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
