var app = app || {};

app.GroupView = Backbone.View.extend({
	template: _.template($('#group-list-item-template').html()),

	events: {
		'click': 'select'
	},

	initialize: function (options) {
		this.model.on('change', this.render, this);
		Backbone.pubSub.on('group:select', this.select, this);
	},
	select: function(e){
		var selected = this.model.get('selected');
		this.model.set('selected', !selected);
	},
	
	render: function () {
		this.$el.html(this.template(this.model.toJSON()));
		this.applyStyling();
		return this;
	},

	applyStyling: function(){
		var isSelected = this.model.get('selected'),
			isActive = this.model.get('active');
		if(isSelected){
			this.$el.find('a').addClass('selected');
		} else {
			this.$el.find('a').removeClass('selected');
		}

		if(isActive){
			this.$el.show();
		} else{
			this.$el.hide();
		}
	}
});
