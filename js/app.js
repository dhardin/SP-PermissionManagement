var app = app || {};

app.state_map = {
    fetchingUsers: false,
    fetchingGroups: false,
    fetchingData: false,
    dataLoadCallback: false,
    filterOptions: false
};

app.DataFetched = function() {
    if (!app.state_map.fetchingUsers && !app.state_map.fetchingGroups) {
        app.state_map.fetchingData = false;
        if (app.state_map.dataLoadCallback) {
            app.state_map.dataLoadCallback();
        }
    }
};

app.userEditFetchData = function() {
    app.state_map.fetchingData = true;
    app.state_map.fetchingUsers = true;
    app.state_map.fetchingGroups = true;

    $.when(

        app.data.getUsers(app.config.url, function(users) {
            var key, i, temp_user, user, new_key, userArr = [];
            users = app.utility.processData(users);

            //initialize data
            app.UserCollection = new app.LibraryUser(users);
            app.state_map.fetchingUsers = false;

        });


        app.data.getPermissions(app.config.url, '', function(groups) {
            var key, i, temp_group, group, new_key, groupArr = [];
            groups = app.utility.processData(groups);

            groupArr = $.extend(true, [], groups);

            app.GroupCollection = new app.LibraryGroup(groups);
            app.GroupAvailCollection = new app.LibraryGroup(groupArr);
            app.GroupSelectedCollection = new app.LibraryGroup([]);
            app.state_map.fetchingGroups = false;
            if (callback) {
                callback();
            }
        });
    ).then(function() {
        app.DataFetched();
    });


};

app.groupEditFetchData = function() {
    app.state_map.fetchingData = true;
    app.state_map.fetchingUsers = true;
    app.state_map.fetchingGroups = true;
    //fetch user data and once complete, set user list.
    app.data.getUsers(app.config.url, function(users) {
        var key, i, temp_user, user, new_key, userArr = [];
        users = app.utility.processData(users);

        userArr = $.extend(true, [], users);
        //initialize data
        app.UserCollection = new app.LibraryUser(users);
        app.UserAvailCollection = new app.LibraryGroup(userArr);
        users.forEach(function(model, index) {
            model.active = false;
        });
        app.UsersSelectedCollection = new app.LibraryUser(users);
        app.state_map.fetchingUsers = false;
        app.DataFetched();
    });
    //fetch group data and once complete, set group listings
    app.data.getPermissions(app.config.url, '', function(groups) {
        var key, i, temp_group, group, new_key, groupArr = [];
        groups = app.utility.processData(groups);

        app.GroupCollection = new app.LibraryGroup(groups);


        app.state_map.fetchingGroups = false;
        app.DataFetched();
    });
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
