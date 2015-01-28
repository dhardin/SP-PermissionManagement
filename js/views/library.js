var app = app || {};

app.LibraryView = Backbone.View.extend({

    initialize: function(options) {
        this.collection.on('add reset remove', function() {
            this.render(this.collection);
        }, this);

        Backbone.pubSub.on('library:search', this.search, this);

        this.search_cache = {};
        this.searchNum = 0;
        this.searchQuery = '';
        this.cachedViews = [];
        this.rank_cache = {};

        this.itemView = options.itemView;
    },

    render: function(collection) {
        var active_items_arr;
        
        this.el_html = [];

        this.$el.html('');
        collection = collection || this.collection;
        active_items_arr = collection.where({active: true});
        collection = new Backbone.Collection(active_items_arr);

        if (collection.length > 0) {
            (function(that) {
                collection.each(function(item) {
                    that.renderItemHtml(item);
                });
            })(this);

            this.$el.html(this.el_html);
            this.onRenderComplete(this.searchQuery);
        } else {
            this.$el.html($('#noItemsTemplate').html());
        }

        return this;
    },

    renderItems: function(modelsArr, index, currentSearchNum) {
        if (this.searchNum != currentSearchNum) {
            return;
        }
        if (index < modelsArr.length) {
            this.renderItem(modelsArr[index]);
            (function(that) {
                setTimeout(function() {
                    index++;
                    that.renderItems(modelsArr, index, currentSearchNum);
                }, 1);
            })(this);
        } else {
            this.onRenderComplete(this.searchQuery);
        }
    },
    renderItemHtml: function(item) {
        var itemView = new this.itemView({
            model: item
        });
        this.el_html.push(itemView.render().el);
    },
    renderItem: function(item) {
        var itemView = new this.itemView({
            model: item
        });

        this.$el.append(itemView.render().el);
    },
    renderFiltered: function(collection) {
        var numActiveItems = 0,
            totalItems = 0,
            numItemsDisplayed = 0, active_items_arr;

        collection = collection || this.collection;
        active_items_arr = collection.where({active: true});
        collection = new Backbone.Collection(active_items_arr);
        //get the total number of active items
        numActiveItems = this.collection.length;
        totalItems = numActiveItems;
        numItemsDisplayed = collection.length;
        if (collection.length == this.collection.length) {
            return this;
        }
        this.$el.html('');
        if (numItemsDisplayed < totalItems) {
            this.$el.append('<div>Displaying ' + numItemsDisplayed + ' out of ' + totalItems + '</div>');
        }

        if (collection.length > 0) {
            this.searchNum++;
            this.renderItems(collection.models, 0, this.searchNum);
        }
    },
    onRenderComplete: function(query) {
        this.search_cache[query] = this.search_cache[query] || {};
        this.search_cache[query].el = this.$el.html();
    },

    search: function(options) {
        var collection = (options && options.collection ? options.collection : this.collection),
            results = [],
            key, val;

        this.searchQuery = options.val || '';

        if (!options || options.val == '' || options.key == '') {
            this.render();
        } else {
            key = options.key;
            val = options.val;

            //check to see if we already searched for this
            this.search_cache[val] = this.search_cache[val] || {};
            results = this.search_cache[val].results;
            //if key isn't cached, go ahead and build a collection
            if (!results) {
                (function(that) {
                    results = that.collection.filter(function(item) {
                        var attributeVal = '',
                            vals = val.split(' '),
                            attributeVals,
                            i = 0,
                            j = 0,
                            rank = 0,
                            isExact = false;
                        attributeVal = item.get(key).toLowerCase();
                        for (i = 0; i < vals.length; i++) {
                            if (attributeVal.indexOf(vals[i]) > -1) {
                                isExact = false;
                                attributeVals = attributeVal.split(' ');
                                for (j = 0; j < attributeVals.length; j++) {
                                    if (attributeVals[j] == vals[i]) {
                                        isExact = true;
                                    }
                                }
                                rank += that._rankMatch(isExact, i, vals.length);
                            }
                            item.set({
                                rank: rank
                            });
                            //only return result if its at least an 80% match or greater
                            if (rank != 0 && rank >= (vals.length * 0.8 * 100)) {
                                return true;
                            } else {
                                return false;
                            }
                        }
                    });
                })(this);

                //sort results
                results.comparator = 'rank';
                results.sort();
                //cache results of search
                this.search_cache[val].results = results;
            }
            this.renderFiltered(new Backbone.Collection(results));
        }
    },
    _rankMatch: function(isExact, matchIndex, matchArrTotal) {
        //returns rank 0 to 100
        var rank = 0,
            exactScore = 100,
            partialScore = 80;
        rank += (isExact ? (matchArrTotal - matchIndex) * exactScore : (matchArrTotal - matchIndex) * partialScore);
        return rank;
    }
});
