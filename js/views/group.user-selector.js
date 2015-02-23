var app = app || {};

app.GroupUsers = Backbone.View.extend({
    template: _.template($('#group-user-select-template').html()),
    tagName: 'div',
    className: 'group-users',

    events: {
        'click .addSingleSelect': 'onAddUserClick',
        'click .addAllSelect': 'onAddUserClick',
        'click .removeSingleSelect': 'onRemoveUserClick',
        'click .removeAllSelect': 'onRemoveUserClick',
        'keyup .users_available .search': 'onSearch',
        'keyup .users_selected .search': 'onSearch',
        'click .search-clear': 'onSearchClear',
        'click .clearSelected': 'onClearSelectedClick'
    },

    initialize: function(options) {
        Backbone.pubSub.on('group:users-fetched', this.onUsersFetched, this);
        Backbone.pubSub.on('group:selected', this.onGroupSelect, this);
        Backbone.pubSub.on('group:save-users', this.onGroupUsersSave, this);
    },

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));

        //initialize our target elements
        this.$usersAvailable = this.$('#users-available');
        this.$usersSelected = this.$('#users-selected');
        this.$buttons = this.$('.control-btn');
        this.toggleButtons(false);

        this.libraryViewUsersSelected = new app.LibraryUsersSelectedView({
            el: this.$usersSelected[0],
            collection: app.UsersSelectedCollection,
            itemView: app.GroupUserView
        });
        this.libraryViewUsersAvailable = new app.LibraryUsersAvailableView({
            el: this.$usersAvailable[0],
            collection: app.UserAvailCollection,
            itemView: app.GroupUserView
        });

        //append views to elements
        this.libraryViewUsersSelected.render();
        this.libraryViewUsersAvailable.render();

        return this;
    },

    onUsersFetched: function(users) {
        var models,
            selectedUsersCollection = this.libraryViewUsersSelected.collection,
            availableUsersCollection = this.libraryViewUsersAvailable.collection;

        this.toggleButtons(true);
        //return if no permissions to set
        if (users.length == 0 || !(users instanceof Array)) {
            return;
        }
        //select permissions in available permissions collection
        users.forEach(function(obj) {
            availableUsersCollection.get(obj.id).set({
                selected: true
            });
        });

        //set collection to matching permissions array
        models = availableUsersCollection
            .where({
                selected: true
            });

        //set permissions and don't select (i.e., hightlight) set permissions
        this.setUsers(availableUsersCollection, selectedUsersCollection, models, false);
    },
    onGroupSelect: function(e) {

        if (this.libraryViewUsersSelected) {
            this.clearUsers();
            this.toggleButtons(false);
        }
    },
    onGroupUsersSave: function(e) {
        this.toggleButtons(false);
        var selectedUsersCollection = this.libraryViewUsersSelected.collection.where({
            active: true
        });
        Backbone.pubSub.trigger('group:selected-users-fetched', selectedUsersCollection);
    },
    onAddUserClick: function(e) {
        var method = $(e.target).attr('data-method'),
            models = [],
            selectedUsersCollection = this.libraryViewUsersSelected.collection,
            availableUsersCollection = this.libraryViewUsersAvailable.collection;

        if ($(e.currentTarget).hasClass('disabled')) {
            return;
        }

        switch (method) {
            case 'single':
                //fetch all models in the collection that are currently selected
                models = availableUsersCollection
                    .where({
                        selected: true
                    });
                break;
            case 'all':
                //fetch all models that are currently displayed (i.e., "active")
                models = availableUsersCollection.models;

                break;

            default:
                return;
                break;
        };
        this.setUsers(availableUsersCollection, selectedUsersCollection, models, false);
    },
    onRemoveUserClick: function(e) {
        var method = $(e.target).attr('data-method'),
            models = [],
            selectedUsersCollection = this.libraryViewUsersSelected.collection,
            availableUsersCollection = this.libraryViewUsersAvailable.collection;

        if ($(e.currentTarget).hasClass('disabled')) {
            return;
        }

        switch (method) {
            case 'single':
                //fetch all models in the collection that are currently selected
                models = selectedUsersCollection
                    .where({
                        selected: true
                    });
                break;
            case 'all':
                //fetch all models that are currently displayed (i.e., "active")
                models = selectedUsersCollection.models;
                //set each model in temp collection to have selected state = true
                //and add model to collection

                break;
            default:
                return;
                break;
        };
        this.setUsers(selectedUsersCollection, availableUsersCollection, models, false);
    },
    clearUsers: function() {
        this.libraryViewUsersSelected.collection.set([]);
        this.libraryViewUsersAvailable.collection.set($.extend([], app.UserCollection.models));
        Backbone.pubSub.trigger('view:reset', this.libraryViewUsersSelected);
        Backbone.pubSub.trigger('view:reset', this.libraryViewUsersAvailable);
    },
    setUsers: function(from_collection, target_collection, models, setSelected) {
       var i = 0;

        for (i = 0; i < models.length; i++) {
            models[i].set({
                selected: setSelected
            });
        }

        Backbone.pubSub.trigger('add', models, target_collection);
        Backbone.pubSub.trigger('remove', models, from_collection);
    },

    onSearchClear: function(e) {
        var $search = $(e.currentTarget).siblings('.search');
        $search.val('');
        $search.trigger('keyup');
    },
    onSearch: function(e) {
        var val = $(e.currentTarget).val(),
            type = $(e.currentTarget).attr('data-method'),
            pubEvent = (type == 'available' ? 'library_users_available:search' : 'library_users_selected:search'),
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
            collection = (type == 'available' ? this.libraryViewUsersAvailable.collection : this.libraryViewUsersSelected.collection);

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
