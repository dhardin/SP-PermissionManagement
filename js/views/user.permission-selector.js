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
        'click .search-clear': 'onSearchClear'
    },

    initialize: function(options) {
        Backbone.pubSub.on('user:permissions-fetched', this.onPermissionFetched, this);
        Backbone.pubSub.on('user:selected', this.onUserSelect, this);
        Backbone.pubSub.on('user:save-permissions', this.onUserPermissionsSave, this);
        this.childViews = [];
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
            collection: app.GroupAvailCollection,
            itemView: app.GroupView
        });

        //append views to elements
        this.libraryViewGroupSelected.render();
        this.libraryViewGroupAvailable.render();
        //clear up any residule permissions
        this.clearPermissions();

        this.childViews.push(this.libraryViewGroupSelected);
        this.childViews.push(this.libraryViewGroupAvailable);

        return this;
    },
    onClose: function(){
        _.each(this.childViews, function(childView){
            childView.remove();
            childView.unbind();
            if(childView.onClose){
                childView.onClose();
            }
        });
        Backbone.pubSub.off('user:permissions-fetched');
        Backbone.pubSub.off('user:selected');
        Backbone.pubSub.off('user:save-permissions');
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
        var models,
            selectedPermissionsCollection = this.libraryViewGroupSelected.collection,
            availablePermissionCollection = this.libraryViewGroupAvailable.collection;

        this.toggleButtons(true);
       

        //return if no permissions to set
        if (permissions.length == 0 || !(permissions instanceof Array)) {
            return;
        }
        //select permissions in available permissions collection
        permissions.forEach(function(obj) {
            availablePermissionCollection.get(obj.id).set({
                selected: true
            });
        });

        //set collection to matching permissions array
        models = availablePermissionCollection
            .where({
                selected: true
            });

        //set permissions and don't select (i.e., hightlight) set permissions
        this.setPermissions(availablePermissionCollection, selectedPermissionsCollection, models, false);
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
                this.setPermissions(availablePermissionCollection, selectedPermissionsCollection, models, false);
                break;
            case 'all':
                //fetch all models that are currently displayed (i.e., "active")
                models = availablePermissionCollection.models;
                //set each model in temp collection to have selected state = true
                //and add model to collection
                this.setPermissions(availablePermissionCollection, selectedPermissionsCollection, models, false);
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
        var i = 0;

        for (i = 0; i < models.length; i++) {
            models[i].set({
                selected: setSelected
            });
        }

        Backbone.pubSub.trigger('add', models, target_collection);
        Backbone.pubSub.trigger('remove', models, from_collection);
    },

    clearPermissions: function() {
        this.libraryViewGroupSelected.collection.set([]);
        this.libraryViewGroupAvailable.collection.set(app.Groups);
        Backbone.pubSub.trigger('view:reset',  this.libraryViewGroupSelected);
          Backbone.pubSub.trigger('view:reset',  this.libraryViewGroupAvailable);
    },


    onSearch: function(e) {
        var val = $(e.currentTarget).val(),
            type = $(e.currentTarget).attr('data-method'),
            pubEvent = (type == 'available' ? 'library_permissions_available:search' : 'library_permissions_selected:search'),
            $search_clear = $(e.currentTarget).siblings('.search-clear'),
            searchAllAttributes = false,
            query;

        //toggle clear 'x' button
        $search_clear.toggleClass('hidden', val.length == 0);

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

        Backbone.pubSub.trigger(settings.pubEvent, settings.query);
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
