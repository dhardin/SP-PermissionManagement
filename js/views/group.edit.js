var app = app || {};

app.GroupEditView = Backbone.View.extend({
    template: _.template($('#group-edit-template').html()),
    tagName: 'div',
    className: 'group-edit',

    events: {
        'keyup .search': 'onGroupsKeyUp',
        'click #groups-select-btn': 'onGroupSelectBtnClick',
        'click .save-users-btn': 'onSaveClick',
        'click #clear-console': 'onClearConsoleClick',
        'click .export-users': 'onExportBtnClick'
    },

    initialize: function(options) {
        Backbone.pubSub.on('group:selected-users-fetched', this.onSelectedUsersFetched, this);
        this.state_map = {
            group_users: null,
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
        };

    },

    select: function(e) {
        Backbone.pubSub.trigger('group:select', this.model);
    },

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        this.$groups = this.$('#groups');
        this.$group_search_container = this.$('.search-container');
        this.$group_search = this.$('.search');
        this.$group_attributes = this.$('.group-attr');
        this.$name = this.$('#name');
        this.$name_container = this.$('#name-container');
        this.$messages = this.$('.messages');
        this.$notify = this.$('.notify');
        this.$progress_meter = this.$('.meter');
        this.$progressbar = this.$('.progress');
        this.$progress_text = this.$('.current-progress');

        if (this.model.get('name') == '') {
            this.$name.text('Select a Group');
        }

        this.libraryViewGroups = new app.LibraryGroupView({
            el: this.$groups[0],
            collection: app.GroupCollection,
            itemView: app.GroupSelectView
        });

        this.libraryViewGroups.render();

        Backbone.pubSub.on('group:select', this.groupSelect, this);
        if (this.model.get('id') != '') {
            this.groupSelect(this.model, false);
        }
        return this;
    },

    search: function() {
        var val = this.$group_search.val(),
            options,
            searchAllAttributes = false;

        //check for search operand character '~'
        if (val.indexOf('~') == 0) {
            //set val to exclude '~'
            val = val.substring(1);
            searchAllAttributes = true;
        }

        options = (searchAllAttributes 
		        	? { val: val }
		        	: {
			            key: 'name',
			            val: val
		        	});

        Backbone.pubSub.trigger('library_groups:search', options);
    },

    onGroupSelectBtnClick: function(e) {
        (function(that) {
            setTimeout(function() {
                that.$group_search.focus();
            }, 0);
        })(this);
    },

    onGroupsKeyUp: function(e) {
        this.search();
    },
    onSelectedPermissionsFetched: function(selected_permissions) {
        var group_users = new Backbone.Collection(this.model.get('users')),
            add_users_arr = [],
            remove_users_arr = [],
            group = this.model.attributes;



        //iterate through selected permissions
        selected_permissions.forEach(function(permission) {
            //check if permissions is in user permissions
            //user_permission_index = group_users_arr.indexOf(permission);
            user_permission = group_users.findWhere({
                name: permission
            });
            if (typeof user_permission !== 'undefined') {
                //remove permission from user permissions
                group_users.remove(user_permission);

            } else {
                //add permission to add permission array
                add_users_arr.push(permission);
            }
        });
        this.state_map.group_users = group_users;
        //set remove permissions to the remaining user permissions...for contextual reasons
        remove_users_arr = group_users.map(function(obj) {
                return obj.get('name');
            }),

            //set state map variables
            this.state_map.pendingSaves = add_users_arr.length;
        this.state_map.pendingRemoves = remove_users_arr.length;
        this.state_map.totalUpdates = this.state_map.pendingRemoves + this.state_map.pendingSaves;
        this.state_map.progressUpdateRatio = 100 / this.state_map.totalUpdates;
        if (add_users_arr.length == 0 && remove_users_arr.length == 0) {
            return;
        }

        this.$messages.append('<span class="console-date">' + app.utility.getDateTime() + '</span><div>Modifying ' + group.name + '\'s users</div>');
        //add group users
        if (add_users_arr.length > 0) {
            (function(that) {
                app.data.modifyUsers(add_users_arr, 0, group, app.config.url, 'add', function(results) {
                    that.processPermissionModify(results);
                });
            })(this);
        }
        //remove group users
        if (remove_users_arr.length > 0) {
            (function(that) {
                app.data.modifyUsers(remove_users_arr, 0, group, app.config.url, 'remove', function(results) {
                    that.processPermissionModify(results);
                });
            })(this);
        }
    },

    onSaveClick: function(e) {
        this.resetStateMap();
        //update progress bar
        this.$progress_meter.width('0%');
        this.$progress_text.text('0%');
        //publish user selected event
        Backbone.pubSub.trigger('group:save-users');
    },

    onClearConsoleClick: function(e) {
        this.clearConsole();
    },

    onExportBtnClick: function(e) {
        var users = this.model.get('users');
        app.utility.JSONToCSVConvertor(users, this.model.get('name') + ' Users', true);
    },

    clearConsole: function() {
        this.$messages.html('');
    },

    processUserModify: function(results) {
        var operation = results.operation,
            type = results.type,
            data = results.data,
            user = results.user,
            message = '',
            class_map = {
                'success': 'success',
                'error': 'error'
            };

        if (type == 'success') {
            this.state_map.success[operation].push(user);
            message = user + ' succesfully ' + (operation == 'add' ? 'added.' : 'removed.');
        } else { //error
            this.state_map.failed[operation].push(user);
            message = 'Unable to ' + operation + ' ' + user + '.'
        }
        this.updateProgress(operation);
        this.$messages.append('<span class="console-date">' + app.utility.getDateTime() + '</span><div class="' + (class_map[type] ? class_map[type] : class_map.error) + '">' + message + '</div>');
        this.$messages.scrollTop(this.$messages[0].scrollHeight);
        if (this.state_map.pendingSaves == 0 && this.state_map.pendingRemoves == 0) {
            this.userModifyComplete();
        }
    },
    userModifyComplete: function() {
        var group = this.model;
        this.$messages.append('<span class="console-date">' + app.utility.getDateTime() + '<span><div>Completed modifying [' + group.get('name') + ']\'s users</div>');
        this.$messages.scrollTop(this.$messages[0].scrollHeight);

        this.groupSelect(group, true);
    },
    updateProgress: function(operation) {
        this.state_map.currentProgress += this.state_map.progressUpdateRatio;
        //clip progress if needed
        this.state_map.currentProgress = (this.state_map.currentProgress >= 100 ? 100 : this.state_map.currentProgress);
        this.state_map.pendingRemoves -= (operation == 'remove' ? 1 : 0);
        this.state_map.pendingSaves -= (operation == 'add' ? 1 : 0);

        //update progress bar
        this.$progress_meter.width(this.state_map.currentProgress + '%');
        this.$progress_text.text(this.state_map.currentProgress + '%');
    },
    resetStateMap: function() {
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
    groupSelect: function(group, options) {

        if (!group.hasOwnProperty('attributes')) {
            return;
        }
        this.model = group;
        this.$group_attributes.each(function(i, el) {
            $(el).val(group.attributes[el.id]);
        });

        //fetch group users
        this.getGroupUsers(group.get('name'));

        //update message
        this.$messages.append('<span class="console-date">' + app.utility.getDateTime() + '</span><div>Fetching [' + group.get('name') + ']\'s users</div>');
        this.$messages.scrollTop(this.$messages[0].scrollHeight);
        //update progress bar
        this.$progress_meter.width('0%');
        this.$progress_text.text('0%');
        //publish user selected event
        //set router
      if (options && options.route) {
            app.router.navigate('edit/group/' + group.get('name'), false);
            Backbone.pubSub.trigger('group:selected');
        } else {
            app.router.navigate('edit/group/' + group.get('name'), false);
        }

    },
    getGroupUsers: function(group_name) {
        (function(that) {
            app.data.getUsersFromGroup(app.config.url, group_name, function(results) {
                //format results
                results = app.utility.processData(results);
                //set selected user model permissions
                that.model.set({
                    users: results
                });
                //publish results globally 
                Backbone.pubSub.trigger('group:users-fetched', results);
                that.$messages.append('<span class="console-date">' + app.utility.getDateTime() + '</span><div>Completed fetching [' + group_name + ']\'s users</div>');
                that.$messages.scrollTop(that.$messages[0].scrollHeight);
                that.$progress_meter.width('100%');
                that.$progress_text.text('100%');
            });
        })(this);
    }
});
