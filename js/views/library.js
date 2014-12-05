var app = app || {};

app.LibraryView = Backbone.View.extend({
	
	initialize: function (options){
		this.collection.on('add reset remove',function(){
			this.render(this.collection);
			}, this
			);

		this.itemView = options.itemView;
		this.filter = options.filter || false;	
		if (this.filter){
			this.search(this.filter)
		} else {
			this.render();
		}
	},

	render: function (collection, isFiltered) {
		collection = collection || this.collection;
		this.$el.html('');

		if (!isFiltered){
			if (collection.length > 0){
				collection.each(function(item){	
					this.renderItem(item);
				}, this);
			} else {
				this.$el.html($('#noChartsTemplate').html());
			}
		} else {
			var totalItems = this.collection.length,
			numItemsDisplayed = collection.toArray().length;
			this.$el.html('Displaying ' + numItemsDisplayed + ' out of ' + totalItems);
			collection.each(function(item){
				this.renderItem(item);
			}, this);
		}
		
		return this;
			},

	renderItem: function(item){
		var itemView = new this.itemView({
			model: item
		});
		this.$el.append(itemView.render().el);
	},

	search: function(options){
		var collection = options.collection || this.collection;

		if (!options){
			this.render();
		}else {
			this.render(collection.search(options), true);	
		}
	}
});