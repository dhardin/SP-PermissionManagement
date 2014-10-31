var app = app || {};

app.Library = Backbone.Collection.extend({
    model: app.Chart,
    comparator: function (property) {
        return selectedStrategy.apply(myModel.get(property));
    },
    strategies: {
        title: function (chart) { return chart.get("title"); }, 
        type: function (chart) { return chart.get("type"); },
        rank: function(chart){return chart.get('rank');}
    },
    changeSort: function (sortProperty) {
        this.comparator = this.strategies[sortProperty];
        this.trigger('sortList');
    },
    initialize: function () {
        this.changeSort("rank"); 
    },
    search: function (text) {
        var regex, key;

        if (text.length == 0) {
            return this;
        }

        regex = new RegExp(text, "gi");

        return _(this.filter(function(data) {
            for (key in data.attributes){
                if (regex.test(data.attributes[key])){
                    return true;
                }
            }
            return false;
        }));

    }                                                                          
});