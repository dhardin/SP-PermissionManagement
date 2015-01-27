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
            this.clearPermissions();
             this.toggleButtons(false);
        }
    },
    onUserPermissionsSave: function(e) {
        //disable edit buttons until save is complete
        this.toggleButtons(false);
        var selectedPermissionsCollection = this.libraryViewGroupSelected.collection.where({
                active: true
            }),
            selectedPermissionsArr = selectedPermissionsCollection.map(function(model) {
                return model.get('name');
            });
        Backbone.pubSub.trigger('user:selected-permissions-fetched', selectedPermissionsArr);

    },
    onAddPermissionClick: function(e) {
        var method = $(e.target).attr('data-method'),
            tempCollection, collection = [],
            selectedPermissionsCollection = this.libraryViewGroupSelected.collection,
            availablePermissionCollection = this.libraryViewGroupAvailable.collection;

        if ($(e.currentTarget).hasClass('disabled')) {
            return;
        }

        switch (method) {
            case 'single':
                //fetch all models in the collection that are currently selected
                tempCollection = availablePermissionCollection
                    .where({
                        selected: true
                    });
                //add each model from the temp collection to the  collection
                this.setPermissions(tempCollection, selectedPermissionsCollection, false);
                break;
            case 'all':
                //fetch all models that are currently displayed (i.e., "active")
                tempCollection = availablePermissionCollection
                    .where({
                        active: true
                    });
                //set each model in temp collection to have selected state = true
                //and add model to collection
                this.setPermissions(tempCollection, selectedPermissionsCollection, false);
                break;

            default:
                break;
        };
    },
    clearPermissions: function() {
        var tempCollection = this.libraryViewGroupSelected.collection
            .where({
                active: true
            }),
            availablePermissionCollection = this.libraryViewGroupAvailable.collection;

        this.setPermissions(tempCollection, availablePermissionCollection, false);

    },
    setPermissions: function(from_collection, target_collection, setSelected) {

        from_collection.forEach(function(model, index) {
            model.set({
                active: false,
                selected: false
            });
         //   target_collection.get(model.id).set({
          //      active: true,
         //       selected: setSelected
        //    });
        });
        target_collection.reset(from_collection);
        target_collection.each(function(model){
            model.set({active: true, selected: setSelected});
        });
    },
    onRemovePermissionClick: function(e) {
        var method = $(e.target).attr('data-method'),
            tempCollection, collection = [],
            selectedPermissionsCollection = this.libraryViewGroupSelected.collection,
            availablePermissionCollection = this.libraryViewGroupAvailable.collection;

        if ($(e.currentTarget).hasClass('disabled')) {
            return;
        }

        switch (method) {
            case 'single':
                //fetch all models in the collection that are currently selected
                tempCollection = selectedPermissionsCollection
                    .where({
                        selected: true
                    });
                //add each model from the temp collection to the  collection
                this.setPermissions(tempCollection, availablePermissionCollection, false);
                break;
            case 'all':
                //fetch all models that are currently displayed (i.e., "active")
                tempCollection = selectedPermissionsCollection
                    .where({
                        active: true
                    });
                //set each model in temp collection to have selected state = true
                //and add model to collection
                this.setPermissions(tempCollection, availablePermissionCollection, false);
                break;
            default:
                break;
        };
    },
    onSearch: function(e) {
        var val = $(e.currentTarget).val(),
            options,
            $search_clear = $(e.currentTarget).siblings('.search-clear'),
            searchAllAttributes = false;

        if (val.length > 0) {
            $search_clear.removeClass('hidden');
        } else {
            $search_clear.addClass('hidden');
        }

        //check for search operand character '~'
        if (val.indexOf('~') == 0 && val.length > 1) {
            //set val to exclude '~'
            val = val.substring(1);
            searchAllAttributes = true;
        } else if (val.indexOf('~') == 0) {
            return;
        }


        options = (searchAllAttributes ? {
            val: val
        } : {
            key: 'name',
            val: val
        });
        if ($(e.currentTarget).parents('.permissions_available').length) {
            Backbone.pubSub.trigger('library_permissions_available:search', options);
        } else {
            Backbone.pubSub.trigger('library_permissions_selected:search', options);
        }
    },

    onClearSelectedClick: function(e) {
        var type = $(e.currentTarget).attr('data-method'),
            collection = (type == 'available' ? this.libraryViewGroupAvailable.collection : this.libraryViewGroupSelected.collection);

        collection.where({
            selected: true
        }).forEach(function(model) {
            model.set({
                selected: false
            });
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
