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
        var regex, collection, key;

      
        collection = _(this.filter(function(data) {
            for(key in options){
                regex = new RegExp(options[key], "i");
                if (regex.test(data.attributes[key])){
                    continue;
                } else {
                    return false;
                }
            }
            return true;
        }));

     return collection;

    }                                                                                      
});