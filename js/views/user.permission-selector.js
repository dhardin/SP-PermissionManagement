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
	},

	select: function(e){
		 Backbone.pubSub.trigger('user:select', this.model);
	},

	render: function () {
		this.$el.html(this.template(this.model.toJSON()));
		
		//initialize our target elements
	
	
		this.$groupAvailable = this.$('#group-available');
		this.$groupSelected = this.$('#group-selected');

		this.libraryViewGroupSelected =  new app.LibraryPermissionsSelectedView({el: this.$groupSelected[0], collection: app.GroupSelectedCollection, itemView: app.GroupView});
		this.libraryViewGroupAvailable =  new app.LibraryPermissionsAvailableView({el: this.$groupAvailable[0], collection: app.GroupCollection, itemView: app.GroupView, filter: {key: 'selected', val: true}});
	
		//append views to elements
	
		this.libraryViewGroupSelected.render();
		this.libraryViewGroupAvailable.render();
		

		return this;
	},
	onAddPermissionClick: function(e){
		var method = $(e.target).attr('data-method'),
			tempCollection = new app.LibraryGroup([]);

		switch(method){
			case 'single':
					tempCollection = app.GroupCollection.models.filter({});
					app.GroupSelectedCollection = this.getFromCollection(tempCollection, {key: 'active', val: true});
				break;
			case 'all':
					app.GroupSelectedCollection = app.GroupCollection;

				break;

			default:
				break;
		};
	},
	onRemovePermissionClick: function(e){
		var method = $(e.target).attr('data-method');

		switch(method){
			case 'single':
					//app.GroupSelectedCollection = getSelected(app.GroupCollection); 
				break;
			case 'all':
					//app.GroupSelectedCollection = app.GroupCollection;
				break;
			default:
				break;
		};
	},
	onSearch: function(e){
		var options = {key: 'name', val: $(e.currentTarget).val()};

		if($(e.currentTarget).hasClass('permissions_available')){
			Backbone.pubSub.trigger('library_permissions_available:search', options);
		} else {
			Backbone.pubSub.trigger('library_permissions_selected:search', options);
		}
	},
});
