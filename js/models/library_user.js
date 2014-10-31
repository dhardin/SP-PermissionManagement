ar app = app || {};

app.Library = Backbone.Collection.extend({
    model: app.User,
    comparator: function (property) {
        return selectedStrategy.apply(myModel.get(property));
    },
    strategies: {
        name: function (user) { return user.get("name"); } 
    },
    changeSort: function (sortProperty) {
        this.comparator = this.strategies[sortProperty];
        this.trigger('sortList');
    },
    initialize: function () {
        this.changeSort("name"); 
    },
    search: function (text, attribute) {
        var regex, key;

        if (text.length == 0) {
            return this;
        }

        regex = new RegExp(text, "gi");

        if (attribute){
             return _(this.filter(function(data) {
                 if (regex.test(data.attributes[attribute])){
                    return true;
                }
                return false;
            }));
        } else {    
            return _(this.filter(function(data) {
                for (key in data.attributes){
                    if (regex.test(data.attributes[key])){
                        return true;
                    }
                }
                return false;
            }));
        }
    }                                                                          
});