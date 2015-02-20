var app = app || {};

app.LibraryView = Backbone.View.extend({

    initialize: function(options) {
        // this.collection.on('add reset remove', function() {
        //      this.render(this.collection);
        //   }, this);

        Backbone.pubSub.on('library:search', this.search, this);
        Backbone.pubSub.on('add', this.add, this);
        Backbone.pubSub.on('remove', this.remove, this);

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
        active_items_arr = collection.where({
            active: true
        });
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

    renderItems: function(modelsArr, index, currentSearchNum, highlightSearch, regex) {;
        if (this.searchNum != currentSearchNum) {
            return;
        }

        if (index < modelsArr.length) {
            if (highlightSearch && regex) {
                this.renderItem(modelsArr[index], highlightSearch, regex);
            } else {
                this.renderItem(modelsArr[index]);
            }

            (function(that) {
                setTimeout(function() {
                    index++;
                    that.renderItems(modelsArr, index, currentSearchNum, highlightSearch, regex);
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
    renderItem: function(item, highlightSearch, regex) {
        var itemView = new this.itemView({
                model: item
            }),
            itemViewEl = itemView.render().el,
            $searchEl = $(itemViewEl).find('.list-item');

        if (highlightSearch && regex) {
            (function(that) {
                $searchEl.each(function() {
                    that.highlightSearchPhrase($(this), that.searchQuery, regex);
                });
            })(this);
        }

        this.$el.append(itemViewEl);
    },
    renderFiltered: function(collection) {
        var numActiveItems = 0,
            totalItems = 0,
            numItemsDisplayed = 0,
            active_items_arr,
            regex;

        collection = collection || this.collection;
        active_items_arr = collection.where({
            active: true
        });
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
            regex = new RegExp(this.searchQuery, 'gi');
            this.renderItems(collection.models, 0, this.searchNum, true, regex);
        }
    },
    add: function(models, collection, index) {
        var model_index = 0,
            itemView, model;

        index = index || 0;



        if (collection != this.collection) {
            return;
        }
        model = models[index];
        this.collection.add(model);
        model_index = this.collection.indexOf(model);

        itemView = new this.itemView({
            model: model
        });

        this.$el.insertAt(model_index, itemView.render().el);
        index = index + 1;
        if (index < models.length) {
            this.add(models, collection, index);
        }
    },
    remove: function(models, collection, index) {
        var itemView, model, model_index;

        index = index || 0;

        if (collection != this.collection) {
            return;
        }

        model = models[index];
        model_index = collection.indexOf(model);
        this.$el.children().eq(model_index).remove();
        this.collection.remove(model);
        index = index + 1;
        if (index < models.length) {
            this.remove(models, collection, index);
        }
    },
    highlightSearchPhrase: function($el, phrase, regex) {
        var content;

        //return if phrase is blank
        if (!$el || !phrase || phrase.length == 0) {
            return;
        }

        content = $el.html();

        content = content.replace(regex || new RegExp(phrase, 'gi'), function(match) {
            return '<span class="match">' + match + '</span>';
        });

        $el.html(content);
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
            val = options.val.toLowerCase();

            //check to see if we already searched for this
            this.search_cache[val] = this.search_cache[val] || {};
            results = this.search_cache[val].results;
            //if key isn't cached, go ahead and build a collection
            if (!results) {
                (function(that) {
                    results = that.collection.filter(function(item) {
                        var attributeVal = item.get(key).toLowerCase();
                        if (attributeVal.indexOf(val) > -1) {
                            return true;
                        }
                    });
                })(this);

                //cache results of search
                this.search_cache[val].results = results;
            }
            this.renderFiltered(new Backbone.Collection(results));
        }
    }
});
