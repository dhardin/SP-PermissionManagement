var app = app || {};

app.UserPermissions = Backbone.View.extend({
    template: _.template($('#user-permission-select-template').html()),
    tagName: 'div',
    className: 'user-permissions',

    events: {
        'click .addSingleSelect': 'onAddPermissionClick',
        'click .addAllSelect': 'onAddPermissionClick',
        'click .removeSingleSelect': 'onRemovePermissionClick',
        'click .removeAllSelect': 'onRemovePermissionClick',
        'keyup .permissions_available .search': 'onSearch',
        'keyup .permissions_selected .search': 'onSearch',
        'click #user-search-button': 'onUserSearchClick',
        'click .search-clear': 'onSearchClear',
        'click .clearSelected': 'onClearSelectedClick'
    },

    initialize: function(options) {
        Backbone.pubSub.on('user:permissions-fetched', this.onPermissionFetched, this);
        Backbone.pubSub.on('user:selected', this.onUserSelect, this);
        Backbone.pubSub.on('user:save-permissions', this.onUserPermissionsSave, this);
    },

    select: function(e) {
        Backbone.pubSub.trigger('user:select', this.model);
    },

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));

        //initialize our target elements
        this.$groupAvailable = this.$('#group-available');
        this.$groupSelected = this.$('#group-selected');
        this.$buttons = this.$('.control-btn');
        this.toggleButtons(false);

        this.libraryViewGroupSelected = new app.LibraryPermissionsSelectedView({
            el: this.$groupSelected[0],
            collection: app.GroupSelectedCollection,
            itemView: app.GroupView
        });
        this.libraryViewGroupAvailable = new app.LibraryPermissionsAvailableView({
            el: this.$groupAvailable[0],
            collection: app.GroupCollection,
            itemView: app.GroupView
        });

        //append views to elements
        this.libraryViewGroupSelected.render();
        this.libraryViewGroupAvailable.render();

        return this;
    },
    onSearchClear: function(e) {
        var $search = $(e.currentTarget).siblings('.search');
        $search.val('');
        $search.trigger('keyup');
    },
    onPermissionSelect: function(e, el) {
        //Backbone.pubSub.trigger('group:select', $(el));
    },
    onPermissionFetched: function(permissions) {
        var tempCollection,
            selectedPermissionsCollection = this.libraryViewGroupSelected.collection,
            availablePermissionCollection = this.libraryViewGroupAvailable.collection;

        this.toggleButtons(true);

        //select permissions in available permissions collection
        permissions.forEach(function(obj) {
            availablePermissionCollection.get(obj.id).set({
                selected: true
            });
        });

        //set collection to matching permissions array
        tempCollection = availablePermissionCollection
            .where({
                selected: true
            });

        //set permissions and don't select (i.e., hightlight) set permissions
        this.setPermissions(tempCollection, selectedPermissionsCollection, false);
    },
    onUserSelect: function(e) {
        if (this.libraryViewGroupSelected) {
            //clear permissions for current user
            this.clearPermissions();
            this.toggleButtons(false);
        }
    },
    onUserPermissionsSave: function(e) {
        //disable edit buttons until save is complete
        this.toggleButtons(false);
        var selectedPermissionsArr = this.libraryViewGroupSelected.collection.models.map(function(model) {
                return model.get('name');
            });
        Backbone.pubSub.trigger('user:selected-permissions-fetched', selectedPermissionsArr);

    },
    onAddPermissionClick: function(e) {
        var method = $(e.target).attr('data-method'),
            models = [],
            selectedPermissionsCollection = this.libraryViewGroupSelected.collection,
            availablePermissionCollection = this.libraryViewGroupAvailable.collection;

        if ($(e.currentTarget).hasClass('disabled')) {
            return;
        }

        switch (method) {
            case 'single':
                //fetch all models in the collection that are currently selected
                models = availablePermissionCollection
                    .where({
                        selected: true
                    });
                //add each model from the temp collection to the  collection
                this.setPermissions(availablePermissionCollection, selectedPermissionsCollection, models,false);
                break;
            case 'all':
                //fetch all models that are currently displayed (i.e., "active")
                models = availablePermissionCollection.models;
                //set each model in temp collection to have selected state = true
                //and add model to collection
                this.setPermissions(availablePermissionCollection, selectedPermissionsCollection, models,false);
                break;

            default:
                break;
        };
    },
      onRemovePermissionClick: function(e) {
        var method = $(e.target).attr('data-method'),
            models,
            selectedPermissionsCollection = this.libraryViewGroupSelected.collection,
            availablePermissionCollection = this.libraryViewGroupAvailable.collection;

        if ($(e.currentTarget).hasClass('disabled')) {
            return;
        }

        switch (method) {
            case 'single':
                //fetch all models in the collection that are currently selected
                models = selectedPermissionsCollection
                    .where({
                        selected: true
                    });
                //add each model from the temp collection to the  collection
                this.setPermissions(selectedPermissionsCollection, availablePermissionCollection, models, false);
                break;
            case 'all':
                //fetch all models that are currently displayed (i.e., "active")
                models = selectedPermissionsCollection.models;
                //set each model in temp collection to have selected state = true
                //and add model to collection
                this.setPermissions(selectedPermissionsCollection, availablePermissionCollection, models, false);
                break;
            default:
                break;
        }
    },
     setPermissions: function(from_collection, target_collection, models, setSelected) {
        target_collection.add(models);
        from_collection.remove(models);
        //set the selected state of the models
        models.forEach(function(model, index) {
            target_collection.get(model.id).set({
                selected: setSelected
            });
        });
    },
  
    clearPermissions: function() {
        this.libraryViewGroupSelected.collection.reset([]);
        this.libraryViewGroupAvailable.collection.reset(app.GroupCollection.models);
    },
   

    onSearch: function(e) {
        var val = $(e.currentTarget).val(),
            type = $(e.currentTarget).attr('data-method'),
            pubEvent = (type == 'available' ? 'library_permissions_available:search' : 'library_permissions_selected:search'),
            $search_clear = $(e.currentTarget).siblings('.search-clear'),
            searchAllAttributes = false,
            query;

        //toggle clear 'x' button
        $search_clear.toggleClass('hidden', val.length > 0);
      
        //check for search operand character '~'
        if (val.indexOf('~') == 0 && val.length > 1) {
            //set val to exclude '~'
            val = val.substring(1);
            searchAllAttributes = true;
        } else if (val.indexOf('~') == 0) {
            return;
        }


        query = (searchAllAttributes ? {
            val: val
        } : {
            key: 'name',
            val: val
        });

        this.search({
            pubEvent: pubEvent,
            query: query
        });
    },

    search: function(settings) {
        if (!settings.pubEvent || !settings.query) {
            return;
        }

        Backbone.pubSub.trigger(settings.pubEvent, settigns.query);
    },

    onClearSelectedClick: function(e) {
        var type = $(e.currentTarget).attr('data-method'),
            pubEvent = (type == 'available' ? 'library_permissions_available:search' : 'library_permissions_selected:search');

        //we seach instead of just doing a backbone collection search because our search caches queries for quick results
        this.search({
            pubEvent: pubEvent,
            query: ''
        });
    },

    toggleButtons: function(enable) {
        this.$buttons.each(function(i, el) {
            if (enable) {
                $(el).removeClass('disabled');
            } else {
                $(el).addClass('disabled');
            }

        });
    }
});
