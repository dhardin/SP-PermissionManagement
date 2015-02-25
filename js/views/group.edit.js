var app = app || {};

app.GroupEditView = Backbone.View.extend({
    template: _.template($('#group-edit-template').html()),
    tagName: 'div',
    className: 'group-edit',

    events: {
        'keyup .search': 'onGroupsKeyUp',
        'click .save-changes-btn': 'onSaveClick',
        'click #clear-console': 'onClearConsoleClick',
        'click .export-users': 'onExportBtnClick',
        'click .search-clear': 'onSearchClear',
        'click .search': 'onSearchClick',
        'focus .search': 'onSearchFocus'
    },

    initialize: function(options) {
        Backbone.pubSub.on('group:selected-users-fetched', this.onSelectedUsersFetched, this);
        Backbone.pubSub.on('group:select', this.groupSelect, this);
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
        this.childViews = [];

    },

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        this.$groups = this.$('#groups');
        this.$group_search_container = this.$('.search-container');
        this.$group_search = this.$('.search');
        this.$group_attributes = this.$('.group-attr');
        this.$group_info = this.$('#group-info');
        this.$name = this.$('#name');
        this.$name_container = this.$('#name-container');
        this.$messages = this.$('.messages');
        this.$notify = this.$('.notify');
        this.$progress_meter = this.$('.meter');
        this.$progressbar = this.$('.progress');
        this.$progress_text = this.$('.current-progress');
        this.$search_clear = this.$('.search-clear');
        this.$search = this.$('.search');
        this.$group_select_btn = this.$('#groups-select-btn');
        this.$save_btn = this.$('.save-changes-btn');
        this.$export_btn = this.$('.export-users');


        if (this.model.get('name') == '') {
            this.toggleButtons(false);
        }


        (function(that) {
            $('body').on('click', function(e) {
                that.onBodyClick(e);
            });
        })(this);


        this.libraryViewGroups = new app.LibraryGroupView({
            el: this.$groups[0],
            collection: app.GroupCollection,
            itemView: app.GroupSelectView
        });

        this.libraryViewGroups.render();
        this.childViews.push(this.libraryViewGroups);

        if (this.model.get('id') != '') {
            this.groupSelect(this.model, false);
        }
        return this;
    },
    onClose: function() {
        _.each(this.childViews, function(childView) {
            childView.remove();
            childView.unbind();
            if (childView.onClose) {
                childView.onClose();
            }
        });
        Backbone.pubSub.off('group:selected-users-fetched');
        Backbone.pubSub.off('group:select');
        $('body').off('click');
    },
    search: function() {
        var val = this.$group_search.val(),
            options,
            searchAllAttributes = false;

        if (val.length > 0) {
            this.$search_clear.removeClass('hidden');
        } else {
            this.$search_clear.addClass('hidden');
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

        Backbone.pubSub.trigger('library_groups:search', options);
    },
    onBodyClick: function(e) {
        var $currentTarget = $(e.currentTarget);

        (function(that) {
            setTimeout(function() {
                //return if users are not visible or the current target is the user search bar
                if (!that.$groups.is(':visible') || $currentTarget[0] === that.$group_search[0]) {
                    return;
                }
                if (document.activeElement === that.$group_info[0]) {
                    return;
                } else {
                    that.$groups.hide();
                }

            }, 10);
        })(this);
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
            message = '[' + user + '] succesfully ' + (operation == 'add' ? 'added.' : 'removed.');
        } else { //error
            this.state_map.failed[operation].push(user);
            message = 'Unable to ' + operation + ' [' + user + '].'
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
        this.state_map.currentProgress = Math.ceil(this.state_map.currentProgress * 100) * 0.01;
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
        var name = group.get('name');
        if (!group.hasOwnProperty('attributes')) {
            return;
        }
        this.$groups.hide();
        this.model = group;
        this.$group_attributes.each(function(i, el) {
            $(el).val(group.attributes[el.id]);
        });

        this.$search.val(name);
        this.$search_clear.show();

        //fetch group users
        this.getGroupUsers(name);

        //update message
        this.$messages.append('<span class="console-date">' + app.utility.getDateTime() + '</span><div>Fetching [' + name + ']\'s users</div>');
        this.$messages.scrollTop(this.$messages[0].scrollHeight);
        //update progress bar
        this.$progress_meter.width('0%');
        this.$progress_text.text('0%');
        //publish user selected event
        //set router
        if (options && options.route) {
            app.router.navigate('edit/group/' + name, false);
            Backbone.pubSub.trigger('group:selected');
        } else {
            app.router.navigate('edit/group/' + name, false);
            Backbone.pubSub.trigger('group:selected');
        }
        Backbone.pubSub.trigger('breadcrumbs');
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
                //enable edit buttons
                that.toggleButtons(true);
                //publish results globally 
                Backbone.pubSub.trigger('group:users-fetched', results);
                that.$messages.append('<span class="console-date">' + app.utility.getDateTime() + '</span><div>Completed fetching [' + group_name + ']\'s users</div>');
                that.$messages.scrollTop(that.$messages[0].scrollHeight);
                that.$progress_meter.width('100%');
                that.$progress_text.text('100%');
            });
        })(this);
    },
    updateGroupInfo: function(updates) {
        //save updates
        (function(that) {
            app.data.updateGroupInfo(app.config.url, updates, function(results) {
                that.onGroupUpdateInfoComplete(results)
            });
        })(this);
    },

    saveGroupInfoUpdates: function() {
        var isUpdating = false,
            updates = {},
            attribute, val,
            group = this.model,
            ownerid, user;


        this.$group_attributes.each(function(i, el) {
            isUpdating = true;
            updates[el.id] = $(el).val();
        });

        //return if no updates
        if (!isUpdating) {
            return;
        }

        updates['oldGroupName'] = group.get('name');
        updates['name'] = updates['name'] || updates['oldGroupName'];
        updates['ownerType'] = (group.get('ownerisuser') ? 'user' : 'group');
        ownerid = group.get('ownerid');
        if (updates['ownerType'] == 'user') { //owner is user
            user = app.UserCollection.findWhere({
                id: group.get('ownerid')
            });
            //check and see if user exists
            //if not, then set the owner as the current user
            if (!user) { //owner does not exist
                (function(that, groupUpdates) {
                    app.data.getCurrentUser(app.config.url, function(results) {
                        var type = results.type,
                            data = results.data,
                            loginname;
                        if (type == 'success') {
                            loginname = data;
                            updates['ownerIdentifier'] = loginname;
                            that.updateGroupInfo(updates);
                        } else {
                            that.onGroupUpdateInfoComplete(results);
                        }

                    });
                })(this, updates);
                return;
            } else { //owner exists
                updates['ownerIdentifier'] = user.get('loginname').replace('/', '\\');
            }
        } else { //owner is group
            updates['ownerIdentifier'] = app.GroupCollection.findWhere({
                id: ownerid
            }).get('name');
        }
        this.updateGroupInfo(updates);
    },
    onGroupUpdateInfoComplete: function(results) {
        var type = results.type,
            data = results.data,
            group = results.updates.oldGroupName,
            message = '',
            class_map = {
                'success': 'success',
                'error': 'error'
            };

        if (type == 'success') {
            message = 'Succesfully updated [' + group + ']\'s info';
            //update model
            this.model.set({
                name: results.updates['name'],
                description: results.updates['description']
            });
        } else { //error
            message = 'Unable to update [' + group + ']\'s info';
            //revert group info
            this.$group_attributes.each(function(i, el) {
                if (results.updates.hasOwnProperty[el.id]) {
                    $(el).val(results.updates[el.id]);
                }
            });
        }
        this.$messages.append('<span class="console-date">' + app.utility.getDateTime() + '</span><div class="' + class_map[type] + '">' + message + '</div>');
        this.$messages.scrollTop(this.$messages[0].scrollHeight);
    },
    onSearchClear: function(e) {
        this.$search.val('');
        this.$search.trigger('keyup');
        e.stopPropagation();
        this.$group_search.focus();
    },
    onSearchClick: function(e) {
        e.stopPropagation();
    },
    onGroupSelectBtnClick: function(e) {
        (function(that) {
            setTimeout(function() {
                that.$group_search.focus();
            }, 25);
        })(this);
    },

    onGroupsKeyUp: function(e) {
        this.search();
    },
    onSelectedUsersFetched: function(selected_users) {
        var group_users = new Backbone.Collection(this.model.get('users')),
            add_users_arr = [],
            remove_users_arr = [],
            group_user,
            group = this.model.attributes;

        //disable toggle buttons
        this.toggleButtons(false);

        //iterate through selected permissions
        selected_users.forEach(function(user) {
            //check if permissions is in user permissions
            group_user = group_users.findWhere({
                loginname: user.get('loginname')
            });
            if (typeof group_user !== 'undefined') {
                //remove permission from user permissions
                group_users.remove(group_user);

            } else {
                //add permission to add permission array
                add_users_arr.push(user.attributes);
            }
        });
        this.state_map.group_users = group_users;
        //set remove permissions to the remaining user permissions...for contextual reasons
        remove_users_arr = group_users.map(function(obj) {
            return obj.attributes;
        });

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
                    that.processUserModify(results);
                });
            })(this);
        }
        //remove group users
        if (remove_users_arr.length > 0) {
            (function(that) {
                app.data.modifyUsers(remove_users_arr, 0, group, app.config.url, 'remove', function(results) {
                    that.processUserModify(results);
                });
            })(this);
        }
    },

    onSaveClick: function(e) {
        if ($(e.currentTarget).hasClass('disabled')) {
            return;
        }
        this.resetStateMap();
        //update progress bar
        this.$progress_meter.width('0%');
        this.$progress_text.text('0%');
        //publish user selected event
        Backbone.pubSub.trigger('group:save-users');

        this.saveGroupInfoUpdates();
    },

    onClearConsoleClick: function(e) {
        this.clearConsole();
    },

    onExportBtnClick: function(e) {
        var users = (this.model ? this.model.get('users') : false),
            ua = window.navigator.userAgent,
            msie = ua.indexOf("MSIE "),
            usersElement;

        if ($(e.currentTarget).hasClass('disabled')) {
            return;
        }

        if (msie > 0) { // If Internet Explorer, return version number
            usersElement = '<h1>' + this.model.get('name') + '\'s Users</h1></ul>';

            if (permissions.length > 1) {
                usersElement += users.reduce(function(memo, obj) {
                    return (typeof memo == "string" ? memo : '<li>' + memo.name + '</li>') + '<li>' + obj.name + '</li>';
                });
            } else {
                usersElement = '<li>' + users[0].name + '</li>';
            }
            usersElement += '</ul>';
            app.utility.printToNewWindow(usersElement);
        } else {
            app.utility.JSONToCSVConvertor(users, this.model.get('name') + ' Users', true);
        }
    },
    toggleButtons: function(enable) {
        if (enable) {
            this.$save_btn.removeClass('disabled');
            this.$export_btn.removeClass('disabled');
        } else {
            this.$save_btn.addClass('disabled');
            this.$export_btn.addClass('disabled');
        }
    },
    clearInfo: function(enable) {
        this.$group_attributes.each(function(i, el) {
            $(el).val('');
        });
    },
    onSearchFocus: function(e) {
        this.$groups.show();
        if (this.$search.val().length > 0) {
            this.$search_clear.show();
        }
    }


});
