var app = app || {};

app.UserEditView = Backbone.View.extend({
	template: _.template($('#user-edit-template').html()),
	tagName: 'div',
	className: 'user-edit',

	events: {
		'keyup .search': 'onSearch',
		'click #user-search-button': 'onUserSearchClick',
		'blur .search-container' : 'onUserSearchBlur'
	},

	initialize: function (options) {

	},

	select: function(e) {
		 Backbone.pubSub.trigger('user:select', this.model);
	},

	render: function () {
		this.$el.html(this.template(this.model.toJSON()));
		this.$users = this.$('#users');
		this.$user_search_container = this.$('.search-container');
		this.$user_search = this.$('.search');
		this.$user_attributes = this.$('.user-attr');
		this.$name = this.$('#name');
		this.$name_container = this.$('#name-container');

		if(this.model.get('name') == '') {
			this.$name.text('Select a name');
		}

		this.libraryViewUsers =  new app.LibraryUserView({
				el: this.$users[0], 
				collection: app.UserCollection, 
				itemView: app.UserView
			});

		this.libraryViewUsers.render();

		Backbone.pubSub.on('user:select', this.userSelect, this);
		
		return this;
	},

	onSearch: function(e){
		var options = {key: 'name', val: $(e.currentTarget).val()};
		
		Backbone.pubSub.trigger('library_users:search', options);
	},

	onUserSearchClick: function(e){
		e.stopPropagation();
		if(!this.$user_search_container.is(':visible')){
			this.$name_container.hide();
			this.$user_search_container.show();
			this.$users.show();
			this.$user_search.focus();
		}

	},

	onUserSearchBlur: function(e){
		//in the event that a user is selected (userSelect is pending call)
		//we delay the blur actions so that the events can be called
		(function(that){
			setTimeout(function(){
				that.$name_container.show();
				that.$user_search_container.hide();
				that.$users.hide();
			},100);
		})(this);
	},

	userSelect: function(user){
		this.$user_attributes.each(function( i, el ){
			$(el).text(user.attributes[el.id]);
		});
		this.$name_container.show();
		this.$user_search_container.hide();
		this.$users.hide();
	}
});
