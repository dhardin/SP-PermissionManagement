var app = app || {};

app.LibraryView = Backbone.View.extend({

    initialize: function(options) {
        this.collection.on('add reset remove', function() {
            this.render(this.collection);
        }, this);

        this.itemView = options.itemView;
        this.filter = options.filter || false;
        if (this.filter) {
            this.search(this.filter)
        } else {
            this.render();
        }
    },

    render: function(collection, isFiltered) {
        var numActiveItems = 0,
            totalItems = 0,
            numItemsDisplayed = 0;


        collection = collection || this.collection;
         this.el_html = [];
         this.numRenderedItems = collection.length;
         this.renderedItems = 0;
        if (isFiltered && collection.length == this.collection.length) {
            return this;
        }
        this.$el.html('');

        if (!isFiltered) {
            if (collection.length > 0) {
               (function(that, targetItem){
            		setTimeout(function(){
            			that.renderItem(targetItem);
            			that.renderedItems++;
            			if (that.renderedItems == that.numRenderedItems){
            				that.onRenderComplete();
            			}
            		},0);
            	})(this, item);
            } else {
                this.$el.html($('#noItemsTemplate').html());
            }
        } else {
            //get the total number of active items
            numActiveItems = this.collection.where({
                active: true
            }).length;
            totalItems = numActiveItems;
            numItemsDisplayed = collection.length;
          
            collection.each(function(item) {
            	  (function(that){
            		setTimeout(function(){
            			that.renderItem(targetItem);
            			that.renderedItems++;
            			if (that.renderedItems == that.numRenderedItems){
            				that.onRenderComplete();
            			}
            		},0);
            	})(this);
            }, this);
            
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

    onRenderComplete: function(){
    	this.$el.html(this.el_html);
    },

    search: function(options) {
        var collection = (options && options.collection ? options.collection : this.collection);

        if (!options || options.val == '') {
            this.render(this.collection, false);
        } else {
            this.render(collection.search(options), true);
        }
    }
});
