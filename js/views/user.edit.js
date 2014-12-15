var app = app || {};

app.UserEditView = Backbone.View.extend({
	template: _.template($('#user-edit-template').html()),
	tagName: 'div',
	className: 'user-edit',

	events: {
		'keyup .search': 'onUsersKeyUp',
		'blur .search-container' : 'onUserSearchBlur',
		'click #user-search-button': 'onUserSearchClick',
		'click .save-permissions-btn': 'onSaveClick'
	},

	initialize: function (options) {
		Backbone.pubSub.on('user:selected-permissions-fetched', this.onSelectedPermissionsFetched, this);
		this.state_map = {
            pendingSaves: 0,
            pendingRemoves: 0,
            totalUpdates: 0,
            progressUpdateRatio: 0,
            currentProgress: 0,
            failed: {
                add: [],
                remove: [],
                purge: []
            },
            success: {
                add: [],
                remove: [],
                purge: []
            }
		}
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
		this.$messages = this.$('.messages');
		this.$notify = this.$('.notify');

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

	search: function(){
		var val = this.$user_search.val(),
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

	onUsersKeyUp: function(e){
		if (e.keyCode == 27) { // escape key pressed
			toggleUserDropdown();
		} else {
			this.search();
		}
	},
	onSelectedPermissionsFetched: function(selected_permissions){
		var user_permissions_arr = this.model.get('permissions').map(function(obj){return obj.name;}),
			user_permission_index,
			add_permissions_arr = [], remove_permissions_arr = [],
			user = this.model.attributes;

		

		//iterate through selected permissions
		selected_permissions.forEach(function(permission){
			//check if permissions is in user permissions
			user_permission_index = user_permissions_arr.indexOf(permission);
			if(user_permission_index != -1) {
				//remove permission from user permissions
				user_permissions_arr.splice(user_permission_index, 1);

			} else {
				//add permission to add permission array
				add_permissions_arr.push(permission);
			}
		});
		//set remove permissions to the remaining user permissions...for contextual reasons
		remove_permissions_arr = user_permissions_arr;

		//set state map variables
		this.state_map.pendingSaves = add_permissions_arr.length;
        this.state_map.pendingRemoves = remove_permissions_arr.length;
        this.state_map.totalUpdates = this.state_map.pendingRemoves + this.state_map.pendingSaves;
        this.state_map.progressUpdateRatio = 100 / this.state_map.totalUpdates;

		//add user permissions
		if(add_permissions_arr.length > 0){
			(function(that){
				app.data.modifyPermissions(add_permissions_arr, 0, user, app.config.url, 'add', function(results){
					that.processPermissionModify(results);
				});
			})(this);
		}
		//remove user permissions
		if(remove_permissions_arr.length > 0){
			(function(that){
				app.data.modifyPermissions(remove_permissions_arr, 0,  user, app.config.url, 'remove', function(results){
					that.processPermissionModify(results);
				});
			})(this);
		}
	},

	onSaveClick: function(e){
		//display notifications
		this.$notify.removeClass('hidden');
		//publish user selected event
		Backbone.pubSub.trigger('user:save-permissions');
	},
	processPermissionModify: function(results){
		var operation = results.operation,
			type = results.type,
			data = results.data,
			permission = results.permission,
			message = '';

		if(type == 'success'){
			this.state_map.success[operation].push(permission);
			message = permission + ' succesfully ' + (operation == 'add' ? 'added.' : 'removed.');
		} else { //error
			this.state_map.fail[operation].push(permission);
			message = 'Unable to ' + operation + ' ' + permission + '.'
		}
		this.updateProgress(operation);
		this.$messages.append('<li>'+ message + '</li>');
	},
	permissionModifyComplete: function(){
		console.log(results);
		this.resetStateMap();
		//hide notifications
		setTimeout(function(){
			this.$notify.addClass('hidden');
		},2000);
	},
	updateProgress: function(operation){
		this.state_map.currentProgress += state_map.progressUpdateRatio;
		//clip progress if needed
        this.state_map.currentProgress = (state_map.currentProgress >= 100 ? 100 : state_map.currentProgress);
        this.state_map.pendingRemoves -= (operation == 'remove' ? 1 : 0);
        this.state_map.pendingSaves -= (operation == 'add' ? 1 : 0);

        //if done making updates, 
         if (state_map.pendingSaves == 0 && !state_map.pendingRemoves == 0){
         	permissionModifyComplete();
         }
	},
	resetStateMap: function(){
		this.state_map.pendingRemoves = 0;
        this.state_map.pendingSaves = 0;
        this.state_map.pendingSaves = 0;
        this.state_map.pendingRemoves = 0;
        this.state_map.totalUpdates = 0;
        this.state_map.progressUpdateRatio = 0;
        this.state_map.failed.add = [];
        this.state_map.failed.remove = [];
        this.state_map.failed.purge = [];
        this.state_map.success.add = [];
        this.state_map.success.remove = [];
        this.state_map.success.purge = [];
	},
	updateNotifyMessage: function(message){

	},
	userSelect: function(user){
		if(!user.hasOwnProperty('attributes')){
			return;
		}
		this.model = user;
		this.$user_attributes.each(function( i, el ){
			$(el).text(user.attributes[el.id]);
		});

		//fetch user permissions
		if(user.attributes.hasOwnProperty('loginname')){
			this.getUserPermissions(user.attributes.loginname);
		}

		//publish user selected event
		Backbone.pubSub.trigger('user:selected');
	},
	getUserPermissions: function(loginname){
		(function(that){
			app.data.getPermissions(app.config.url, loginname, function(results){
				//format results
				results = app.utility.processData(results);
				//set selected user model permissions
				that.model.set({permissions: results});
				//publish results globally 
				Backbone.pubSub.trigger('user:permissions-fetched', results);
			});
		})(this);
	},
	toggleUserDropdown: function(){
		if(this.$name_container.is(':visible')){
			this.$name_container.hide();
			this.$user_search_container.show();
			this.$users.show();
			this.$user_search.focus();
			this.$users.height(function(index, height) {
			    return (window.innerHeight - $(this).offset().top) * 0.9;
			});

			this.$users.width(function(index, height) {
				  return (window.innerWidth - $(this).offset().left) * 0.9;
			});
		} else {
			this.$name_container.show();
			this.$user_search_container.hide();
			this.$users.hide();
		}
	}
});
