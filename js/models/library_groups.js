var app = app || {};

app.LibraryGroup = Backbone.Collection.extend({
    model: app.Group,
    comparator: function (property) {
        return selectedStrategy.apply(myModel.get(property));
    },
    strategies: {
        name: function (group) { return group.get("name"); }
    },
    changeSort: function (sortProperty) {
        this.comparator = this.strategies[sortProperty];
        this.trigger('sortList');
    },
    initialize: function () {
        this.changeSort("name"); 
    },
    search: function (options) {
          var regex,
            key = options.key || false,
            val = options.val || '',
            collection;

        if (val.length == 0) {
            return this;
        }

        regex = new RegExp(val, "i");

        collection = _(this.filter(function(data) {
            if(key){
                if (regex.test(data.attributes[key])){
                        return true;
                }
            } else {
                 for (key in data.attributes){
                    if (regex.test(data.attributes[key])){
                        return true;
                    }
                }
            }
           
            return false;
        }));

        return collection;

    }                                                                                         
});