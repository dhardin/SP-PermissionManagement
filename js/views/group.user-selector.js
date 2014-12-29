var app = app || {};

app.UserPermissions = Backbone.View.extend({
	template: _.template($('#item-select-template').html()),
	tagName: 'div',
	className: 'group-users',

	events: {
		'click .addSingleSelect' : 'onAddUserClick',
		'click .addAllSelect' : 'onAddUserClick',
		'click .removeSingleSelect' : 'onRemoveUserClick',
		'click .removeAllSelect' : 'onRemoveUserClick',
		'keyup .search.permissions_available' : 'onSearch',
		'keyup .search.permissions_selected' : 'onSearch',
		'click #group-search-button' : 'onGroupSearchClick'
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

		this.libraryViewUserSelected =  new app.LibraryUsersSelectedView({
			el: this.$usersSelected[0], 
			collection: app.GroupSelectedCollection, 
			itemView: app.UserView
		});
		this.libraryViewUserAvailable =  new app.LibraryUsersAvailableView({
			el: this.$usersAvailable[0], 
			collection: app.GroupCollection, 
			itemView: app.UserView, 
			filter: {key: 'selected', val: true}
		});
	
		//append views to elements
		this.libraryViewUserSelected.render();
		this.libraryViewUserAvailable.render();
	   
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
		this.setPermissions(tempCollection, selectedPermissionsCollection, false);
	},
	onUserSelect: function(e){
		this.clearPermissions();
	},
	onUserPermissionsSave: function(e){
		var selectedPermissionsCollection = this.libraryViewGroupSelected.collection.where({active: true}),
			selectedPermissionsArr = selectedPermissionsCollection.map(function(model){
										return model.get('name');
									});
		Backbone.pubSub.trigger('user:selected-permissions-fetched', selectedPermissionsArr);

	},
	onAddPermissionClick: function(e){
		var method = $(e.target).attr('data-method'), tempCollection, collection = [],
					 selectedPermissionsCollection = this.libraryViewGroupSelected.collection,
					 availablePermissionCollection =  this.libraryViewGroupAvailable.collection;

		switch(method){
			case 'single':
				//fetch all models in the collection that are currently selected
				tempCollection = availablePermissionCollection
								.where({selected:true});
				//add each model from the temp collection to the  collection
				this.setPermissions(tempCollection, selectedPermissionsCollection, false);
				break;
			case 'all':
				//fetch all models that are currently displayed (i.e., "active")
				tempCollection = availablePermissionCollection
								.where({active:true});
				//set each model in temp collection to have selected state = true
				//and add model to collection
				this.setPermissions(tempCollection, selectedPermissionsCollection, false);
				break;

			default:
				break;
		};
	},
	clearPermissions: function(){
		var tempCollection = this.libraryViewGroupSelected.collection
								.where({active:true}),
		 	availablePermissionCollection =  this.libraryViewGroupAvailable.collection;

		 	this.setPermissions(tempCollection, availablePermissionCollection, false);

	},
	setPermissions: function(from_collection, target_collection, setSelected){
		 from_collection.forEach(function(model,index){
			    	model.set({active: false, selected: false});
			    	target_collection.get(model.id).set({active: true, selected: setSelected});
				});
	},
	onRemovePermissionClick: function(e){
		var method = $(e.target).attr('data-method'), tempCollection, collection = [],
					 selectedPermissionsCollection = this.libraryViewGroupSelected.collection,
					 availablePermissionCollection =  this.libraryViewGroupAvailable.collection;

		switch(method){
			case 'single':
					//fetch all models in the collection that are currently selected
				tempCollection = selectedPermissionsCollection
								.where({selected:true});
				//add each model from the temp collection to the  collection
				this.setPermissions(tempCollection, availablePermissionCollection, false);
				break;
			case 'all':
				//fetch all models that are currently displayed (i.e., "active")
				tempCollection = selectedPermissionsCollection
								.where({active:true});
				//set each model in temp collection to have selected state = true
				//and add model to collection
				this.setPermissions(tempCollection, availablePermissionCollection, false);
				break;
			default:
				break;
		};
	},
	onSearch: function(e){
		var availPermissions = this.libraryViewGroupSelected.collection,
			selectedPermission = this.libraryViewGroupSelected.collection,
			filteredCollection, 
			searchOptions = {active:true, name: $(e.currentTarget).val()};

			if(searchOptions.name == ""){
				searchOptions = false;
			}

		if($(e.currentTarget).hasClass('permissions_available')){
			Backbone.pubSub.trigger('library_permissions_available:search', searchOptions);
		} else {
			Backbone.pubSub.trigger('library_permissions_selected:search', searchOptions);
		}
	},
});
