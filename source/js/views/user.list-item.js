var app = app || {};

app.GroupUserView = Backbone.View.extend({
	template: _.template($('#user-edit-list-item-template').html()),

	events: {
		'click a': 'select'
	},

	initialize: function (options) {
		this.model.on('change', this.render, this);
		//Backbone.pubSub.on('user:select', this.select, this);
	},
	select: function(e){
		e.stopPropagation();
		var selected = this.model.get('selected');
		this.model.set('selected', !selected);
	},
	onClose: function(){
		this.model.off('change');
		Backbone.pubSub.off('user:select');
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
