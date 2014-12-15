var app = app || {};

app.UserPermissions = Backbone.View.extend({
	template: _.template($('#user-permission-select-template').html()),
	tagName: 'div',
	className: 'user-permissions',

	events: {
		'click .addSingleSelect' : 'onAddPermissionClick',
		'click .addAllSelect' : 'onAddPermissionClick',
		'click .removeSingleSelect' : 'onRemovePermissionClick',
		'click .removeAllSelect' : 'onRemovePermissionClick',
		'keyup .search.permissions_available' : 'onSearch',
		'keyup .search.permissions_selected' : 'onSearch',
		'click #user-search-button' : 'onUserSearchClick'
	},

	initialize: function (options) {
		Backbone.pubSub.on('user:permissions-fetched', this.onPermissionFetched, this);
		Backbone.pubSub.on('user:selected', this.onUserSelect, this);
		Backbone.pubSub.on('user:save-permissions', this.onUserPermissionsSave, this);
	},

	select: function(e){
		 Backbone.pubSub.trigger('user:select', this.model);
	},

	render: function () {
		this.$el.html(this.template(this.model.toJSON()));
		
		//initialize our target elements
		this.$groupAvailable = this.$('#group-available');
		this.$groupSelected = this.$('#group-selected');

		this.libraryViewGroupSelected =  new app.LibraryPermissionsSelectedView({
			el: this.$groupSelected[0], 
			collection: app.GroupSelectedCollection, 
			itemView: app.GroupView
		});
		this.libraryViewGroupAvailable =  new app.LibraryPermissionsAvailableView({
			el: this.$groupAvailable[0], 
			collection: app.GroupCollection, 
			itemView: app.GroupView, 
			filter: {key: 'selected', val: true}
		});
	
		//append views to elements
		this.libraryViewGroupSelected.render();
		this.libraryViewGroupAvailable.render();
		

		return this;
	},
	onPermissionFetched: function(permissions){
		var tempCollection,
			selectedPermissionsCollection = this.libraryViewGroupSelected.collection,
			availablePermissionCollection =  this.libraryViewGroupAvailable.collection;

		//select permissions in available permissions collection
		permissions.forEach(function(obj){
			availablePermissionCollection.get(obj.id).set({selected:true});
		});

		//set collection to matching permissions array
		tempCollection = availablePermissionCollection
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
				this.setPermissions(tempCollection, selectedPermissionsCollection, true);
				break;
			case 'all':
				//fetch all models that are currently displayed (i.e., "active")
				tempCollection = availablePermissionCollection
								.where({active:true});
				//set each model in temp collection to have selected state = true
				//and add model to collection
				this.setPermissions(tempCollection, selectedPermissionsCollection, true);
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
				this.setPermissions(tempCollection, availablePermissionCollection, true);
				break;
			case 'all':
				//fetch all models that are currently displayed (i.e., "active")
				tempCollection = selectedPermissionsCollection
								.where({active:true});
				//set each model in temp collection to have selected state = true
				//and add model to collection
				this.setPermissions(tempCollection, availablePermissionCollection, true);
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
