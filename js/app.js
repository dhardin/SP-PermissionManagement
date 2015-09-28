var app = app || {};

app.state_map = {
    fetchingData: false,
    dataLoadCallback: false,
    filterOptions: false,
    fetched: {
        editUser: false,
        editGroup: false
    }
};

app.DataFetched = function() {
    app.state_map.fetchingData = false;
    if (app.state_map.dataLoadCallback) {
        app.state_map.dataLoadCallback();
    }
};

app.userEditFetchData = function() {
    app.state_map.fetchingData = true;

    if (app.config.testing) {
        var users = data.test.users,
        groups = data.test.groups;
        app.Users = users;
        app.UserCollection = new app.LibraryUser(users);

        app.Groups = groups;
        groupArr = $.extend(true, [], groups);
        app.GroupCollection = new app.LibraryGroup(groups);
        app.GroupAvailCollection = new app.LibraryGroup(groupArr);
        app.GroupSelectedCollection = new app.LibraryGroup([]);

        app.state_map.fetched.editUser = true;
        app.DataFetched();
    } else {
        $.when(
            (function() {
                var deferred = $.Deferred();
                app.data.getUsers(app.config.url, function(users) {
                    var key, i, temp_user, user, new_key, userArr = [];
                    users = app.utility.processData(users);
                    app.Users = users;
                    //initialize data
                    app.UserCollection = new app.LibraryUser(users);
                    deferred.resolve();

                });
                return deferred.promise();
            })(), (function() {
                var deferred = $.Deferred();
                app.data.getPermissions(app.config.url, '', function(groups) {
                    var key, i, temp_group, group, new_key, groupArr = [];
                    groups = app.utility.processData(groups);
                    app.Groups = groups;
                    groupArr = $.extend(true, [], groups);

                    app.GroupCollection = new app.LibraryGroup(groups);
                    app.GroupAvailCollection = new app.LibraryGroup(groupArr);
                    app.GroupSelectedCollection = new app.LibraryGroup([]);

                    deferred.resolve();
                });
                return deferred.promise();
            })()
        ).then(function() {
            app.state_map.fetched.editUser = true;
            app.DataFetched();
        });
    }
};

app.groupEditFetchData = function() {
    app.state_map.fetchingData = true;

    if (app.config.testing) {
        var users = data.test.users,
        groups = data.test.groups;
        userArr = $.extend(true, [], users);
        //initialize data
        app.Users = users;
        app.UserCollection = new app.LibraryUser(users);
        app.UserAvailCollection = new app.LibraryGroup(userArr);
        users.forEach(function(model, index) {
            model.active = false;
        });
        app.UsersSelectedCollection = new app.LibraryUser(users);
        app.Groups = groups;
        app.GroupCollection = new app.LibraryGroup(groups);

        app.state_map.fetched.editGroup = true;
        app.DataFetched();
    } else {


        $.when(
            (function() {
                var deferred = $.Deferred();
                //fetch user data and once complete, set user list.
                app.data.getUsers(app.config.url, function(users) {
                    var key, i, temp_user, user, new_key, userArr = [];
                    users = app.utility.processData(users);

                    userArr = $.extend(true, [], users);
                    //initialize data
                    app.Users = users;
                    app.UserCollection = new app.LibraryUser(users);
                    app.UserAvailCollection = new app.LibraryGroup(userArr);
                    users.forEach(function(model, index) {
                        model.active = false;
                    });
                    app.UsersSelectedCollection = new app.LibraryUser(users);

                    deferred.resolve();

                });
                return deferred.promise();
            })(), (function() {
                var deferred = $.Deferred();
                //fetch group data and once complete, set group listings
                app.data.getPermissions(app.config.url, '', function(groups) {
                    var key, i, temp_group, group, new_key, groupArr = [];
                    groups = app.utility.processData(groups);
                    app.Groups = groups;
                    app.GroupCollection = new app.LibraryGroup(groups);

                    deferred.resolve();
                });
                return deferred.promise();
            })()
        ).then(function() {
            app.state_map.fetched.editGroup = true;
            app.DataFetched();

        });
    }
};

$.fn.insertAt = function(index, element) {
    var lastIndex = this.children().size();

    if (index < 0) {
        index = Math.max(0, lastIndex + 1 + index);
    }
    this.append(element);
    if (index < lastIndex) {
        this.children().eq(index).before(this.children().last());
    }
    return this;
}
