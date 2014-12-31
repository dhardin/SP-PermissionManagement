var app = app || {};

app.GroupUsers = Backbone.View.extend({
	template: _.template($('#group-user-select-template').html()),
	tagName: 'div',
	className: 'group-users',

	events: {
		'click .addSingleSelect' : 'onAddUserClick',
		'click .addAllSelect' : 'onAddUserClick',
		'click .removeSingleSelect' : 'onRemoveUserClick',
		'click .removeAllSelect' : 'onRemoveUserClick',
		'keyup .search.users_available' : 'onSearch',
		'keyup .search.users_selected' : 'onSearch'
	},

	initialize: function (options) {
		Backbone.pubSub.on('group:users-fetched', this.onPermissionFetched, this);
		Backbone.pubSub.on('group:selected', this.onUserSelect, this);
		Backbone.pubSub.on('group:save-users', this.onUserPermissionsSave, this);
	},

	select: function(e){
		 Backbone.pubSub.trigger('group:select', this.model);
	},

	render: function () {
		this.$el.html(this.template(this.model.toJSON()));
		
		//initialize our target elements
		this.$usersAvailable = this.$('#users-available');
		this.$usersSelected = this.$('#users-selected');

		this.libraryViewUsersSelected =  new app.LibraryUsersSelectedView({
			el: this.$usersSelected[0], 
			collection: app.UsersSelectedCollection, 
			itemView: app.GroupUserView
		});
		this.libraryViewUsersAvailable =  new app.LibraryUsersAvailableView({
			el: this.$usersAvailable[0], 
			collection: app.UserCollection, 
			itemView: app.GroupUserView, 
			filter: {key: 'selected', val: true}
		});
	
		//append views to elements
		this.libraryViewUsersSelected.render();
		this.libraryViewUsersAvailable.render();
	   
		return this;
	},
	onPermissionSelect: function(e, el){
 		//Backbone.pubSub.trigger('group:select', $(el));
	},
	onPermissionFetched: function(permissions){
		var tempCollection,
			selectedUsersCollection = this.libraryViewUsersSelected.collection,
			availableUsersCollection =  this.libraryViewUsersAvailable.collection;

		//select permissions in available permissions collection
		permissions.forEach(function(obj){
			availableUsersCollection.get(obj.id).set({selected:true});
		});

		//set collection to matching permissions array
		tempCollection = availableUsersCollection
								.where({selected:true});

		//set permissions and don't select (i.e., hightlight) set permissions
		this.setUsers(tempCollection, selectedUsersCollection, false);
	},
	onUserSelect: function(e){
		this.clearPermissions();
	},
	onUserPermissionsSave: function(e){
		var selectedUsersCollection = this.libraryViewGroupSelected.collection.where({active: true}),
			selectedUsersArr = selectedUsersCollection.map(function(model){
										return model.get('name');
									});
		Backbone.pubSub.trigger('user:selected-permissions-fetched', selectedUsersArr);

	},
	onAddUserClick: function(e){
		var method = $(e.target).attr('data-method'), tempCollection, collection = [],
					 selectedUsersCollection = this.libraryViewUsersSelected.collection,
					 availableUsersCollection =  this.libraryViewUsersAvailable.collection;

		switch(method){
			case 'single':
				//fetch all models in the collection that are currently selected
				tempCollection = availableUsersCollection
								.where({selected:true});
				//add each model from the temp collection to the  collection
				this.setUsers(tempCollection, selectedUsersCollection, false);
				break;
			case 'all':
				//fetch all models that are currently displayed (i.e., "active")
				tempCollection = availableUsersCollection
								.where({active:true});
				//set each model in temp collection to have selected state = true
				//and add model to collection
				this.setUsers(tempCollection, selectedUsersCollection, false);
				break;

			default:
				break;
		};
	},
	clearUsers: function(){
		var tempCollection = this.libraryViewUsersSelected.collection
								.where({active:true}),
		 	availableUsersCollection =  this.libraryViewUsersAvailable.collection;

		 	this.setUsers(tempCollection, availableUsersCollection, false);

	},
	setUsers: function(from_collection, target_collection, setSelected){
		 from_collection.forEach(function(model,index){
			    	model.set({active: false, selected: false});
			    	target_collection.get(model.id).set({active: true, selected: setSelected});
				});
	},
	onRemoveUserClick: function(e){
		var method = $(e.target).attr('data-method'), tempCollection, collection = [],
					 selectedUsersCollection = this.libraryViewUsersSelected.collection,
					 availableUsersCollection =  this.libraryViewUsersAvailable.collection;

		switch(method){
			case 'single':
					//fetch all models in the collection that are currently selected
				tempCollection = selectedUsersCollection
								.where({selected:true});
				//add each model from the temp collection to the  collection
				this.setUsers(tempCollection, availableUsersCollection, false);
				break;
			case 'all':
				//fetch all models that are currently displayed (i.e., "active")
				tempCollection = selectedUsersCollection
								.where({active:true});
				//set each model in temp collection to have selected state = true
				//and add model to collection
				this.setUsers(tempCollection, availableUsersCollection, false);
				break;
			default:
				break;
		};
	},
	onSearch: function(e){
			  var val = $(e.currentTarget).val(),
            options,
            searchAllAttributes = false;

        //check for search operand character '~'
        if (val.indexOf('~') == 0) {
            //set val to exclude '~'
            val = val.substring(1);
            searchAllAttributes = true;
        }

        options = (searchAllAttributes ? {
            val: val
        } : {
            key: 'name',
            val: val
        });

		if($(e.currentTarget).hasClass('users_available')){
			Backbone.pubSub.trigger('library_users_available:search', options);
		} else {
			Backbone.pubSub.trigger('library_users_selected:search', options);
		}
	}
});
