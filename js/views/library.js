var app = app || {};

app.LibraryView = Backbone.View.extend({

    initialize: function(options) {
        this.collection.on('add reset remove', function() {
            this.render(this.collection);
        }, this);

        this.search_cache = {};

        this.itemView = options.itemView;
        this.render();
    },

    render: function(collection, isFiltered) {
        var numActiveItems = 0,
            totalItems = 0,
            numItemsDisplayed = 0;
        this.el_html = [];

        collection = collection || this.collection;
        if (isFiltered && collection.length == this.collection.length) {
            return this;
        }
        //first check to see if we've already rendered items in our list before
        if(this.$el.html() != ''){
        	this.showFilteredItems(collection);
        }

        this.$el.html('');

        if (!isFiltered) {
            if (collection.length > 0) {
                collection.each(function(item) {
                    this.renderItem(item);
                }, this);
                this.$el.html(this.el_html);
            } else {
                this.$el.html($('#noItemsTemplate').html());
            }
        } else {
            //get the total number of active items
            numActiveItems = this.collection.where({
                active: true
            }).length;
            totalItems = numActiveItems;
            numItemsDisplayed = collection.toArray().length;

            collection.each(function(item) {
                this.renderItem(item);
            }, this);
            this.$el.html(this.el_html);
            if (numItemsDisplayed < totalItems) {
                this.$el.prepend('<div>Displaying ' + numItemsDisplayed + ' out of ' + totalItems + '</div>');
            }
        }

        return this;
    },

    renderItem: function(item) {
        var itemView = new this.itemView({
            model: item
        });
        this.el_html.push(itemView.render().el);
    },

    showFilteredItems: function(collection){
    	  //get the total number of active items
            var numActiveItems = this.collection.where({
                active: true
            }).length;
            var totalItems = numActiveItems;
            var numItemsDisplayed = collection.toArray().length;

            collection.each(function(item) {
                this.showItem(item);
            }, this);

            if (numItemsDisplayed < totalItems) {
            	if(this.$('.numItemsDisplayed').length == 0){
                this.$el.prepend('<div class="numItemsDisplay">Displaying ' + numItemsDisplayed + ' out of ' + totalItems + '</div>');
            	} else {
            		this.$('.numItemsDisplayed').show();
            	}
            } else {
            	this.$('.numItemsDisplayed').hide();
            }
    },

    showItem: function(item){
    	item.set({visible: true});
    },

    search: function(options) {
        var collection = (options && options.collection ? options.collection : this.collection),
            results = [],
            key, val;

        if (!options || options.val == '' || options.key == '') {
            this.render(this.collection, false);
        } else {
            key = options.key;
            val = options.val;

            //check to see if we already searched for this
            results = this.search_cache[val];

            //if key isn't cached, go ahead and build a collection
            if (!results) {
                results = this.collection.filter(function(item) {
                    var attributeVal = '';
                    attributeVal = item.get(key).toLowerCase();
                    return (attributeVal.indexOf(val) > -1);
                });
                //cache results of search
                this.search_cache[val] = results;
            }
            this.render(new Backbone.Collection(results), true);
        }
    }
});
