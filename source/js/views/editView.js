var app = app || {};

app.EditItemView = Backbone.View.extend({
	template: _.template($('#edit-item-template').html()),

	initialize: function(options){
		options = options || {};
		this.childViews = [];
		this.itemEditView = options.itemEditView || false;
		this.itemListView = options.itemListView || false;

	},

	render: function () {
		this.$el.html(this.template((this.model ? this.model.toJSON() : {})));
		this.$item = this.$('#item');
		this.$item_list = this.$('#item-list');
        this.$items = this.$('#items');

        if(!this.itemEditView || !this.itemListView){
        	return;
        }

		this.ItemEditView = new this.itemEditView({
				el: this.$item[0],
				model: this.model
			});

		this.ItemListView = new this.itemListView({
			el: this.$items[0],
			model: this.model
		});

		this.ItemEditView.render();
		this.ItemListView.render();
		this.childViews.push(this.ItemEditView);
		this.childViews.push(this.ItemListView);
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
