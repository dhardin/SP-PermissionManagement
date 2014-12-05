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
		var val = $(e.currentTarget).val(),
			options,
			searchAllAttributes = false;

			//check for search operand character '~'
			if(val.indexOf('~') == 0){
				//set val to exclude '~'
				val = val.substring(1);
				searchAllAttributes = true;
			}

			options = (searchAllAttributes ? {val: val} : {key: 'name', val: val});
		
		Backbone.pubSub.trigger('library_users:search', options);
	},

	onUserSearchClick: function(e){
		e.stopPropagation();
		this.toggleUserDropdown();
	},

	onUserSearchBlur: function(e){
		//in the event that a user is selected (userSelect is pending call)
		//we delay the blur actions so that the events can be called
		(function(that){
			setTimeout(function(){
				that.toggleUserDropdown();
			},100);
		})(this);
	},

	userSelect: function(user){
		if(!user.hasOwnProperty('attributes')){
			return;
		}
		this.$user_attributes.each(function( i, el ){
			$(el).text(user.attributes[el.id]);
		});
		this.toggleUserDropdown();

		//fetch user permissions
		if(user.attributes.hasOwnProperty('username')){
			this.getUserPermissions(user.attributes.username);
		}
	},

	getUserPermissions: function(username){
		app.data.getPermissions(app.config.url, username, function(results){
			//format results
			results = app.utility.processData(results);
			//publish results globally 
			Backbone.pubSub.trigger('user:permissions-fetched', results);
		});
	},
	toggleUserDropdown: function(){
		if(this.$name_container.is(':visible')){
			this.$name_container.hide();
			this.$user_search_container.show();
			this.$users.show();
			this.$user_search.focus();
		} else {
			this.$name_container.show();
			this.$user_search_container.hide();
			this.$users.hide();
		}
	}
});
