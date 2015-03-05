var app = app || {};

app.FetchingDataView = Backbone.View.extend({
    template: _.template($('#fetchingDataTemplate').html()),

    render: function() {
        this.$el.html(this.template());
        this.$ellipsis = this.$('.ellipsis');
        this.ellipsis_count = 0;
        this.ellipsis_max = 3;
        this.ellipsisRender(1000);
        return this;
    },

    ellipsisRender: function(timeout) {
        (function interval(that) {
            that.ellipsis_count++;
            if(that.ellipsis_count == that.ellipsis_max){
            	that.$ellipsis.html('');
            	that.ellipsis_count = 0;
            }
            that.$ellipsis.append('.');
            setTimeout(function(){interval(that);}, timeout);
        })(this);
    }
});
