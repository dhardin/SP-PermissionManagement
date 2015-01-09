var app = app || {};

var Router = Backbone.Router.extend({
    routes: {
        '': 'selectEdit',
        'edit/user/:loginname': 'editUser',
        'edit/user/*': 'editUser',
        'edit/group/:name': 'editGroup',
        'edit/group/*': 'editGroup',
        'edit/*':'selectEdit',
        '*404': 'error'
    },

    initialize: function(options) {
        this.AppView = options.AppView;
        this.on('route', this.onRouteChange);
        Backbone.pubSub.on('breadcrumbs', this.onRouteChange, this);
    },
    selectEdit: function() {
        var selectEditView = new app.SelectEditView();
        app.router.AppView.showView(selectEditView);
    },
    error: function(){
        var errorView = new app.ErrorView();
        app.router.AppView.showView(errorView);
    },
    editUser: function(loginname) {
    	var fetchingDataView,editUserPermissionView, user;

        app.state_map.fetchId = (loginname != null ? loginname.replace('\\', '/') : "");
        if (app.config.isTesting) {
            app.setTestData('user');
        } else {
            app.userEditFetchData();
        }

        if (app.state_map.fetchingData) {
            fetchingDataView = new app.FetchingDataView();

            this.AppView.showView(fetchingDataView);

            app.state_map.dataLoadCallback = function() {
                user = (app.state_map.fetchId && app.UserCollection.findWhere({
                            loginname: app.state_map.fetchId
                        }) ?
                        app.UserCollection.findWhere({
                            loginname: app.state_map.fetchId
                        }) : new app.User()),
                    editUserPermissionView = new app.EditUserPermissionsView({
                        model: user
                    });

                app.router.AppView.showView(editUserPermissionView);
            };
        } else if (loginname) {
            user = (app.UserCollection.findWhere({
                        loginname: app.state_map.fetchId
                    }) ?
                    app.UserCollection.findWhere({
                        loginname: app.state_map.fetchId
                    }) : new app.User()),
                editUserPermissionView = new app.EditUserPermissionsView({
                    model: user
                });

            app.router.AppView.showView(editUserPermissionView);
        } else {
            editUserPermissionView = new app.EditUserPermissionsView({
                model: new app.User()
            });

            this.AppView.showView(editUserPermissionView);
        }
    },
    editGroup: function(name) {
        app.state_map.fetchId = (name != null ? name : "");
        if (app.config.isTesting) {
            app.setTestData('group');

        } else {
            app.groupEditFetchData();
        }

        if (app.state_map.fetchingData) {
            var fetchingDataView = new app.FetchingDataView();

            this.AppView.showView(fetchingDataView);

            app.state_map.dataLoadCallback = function() {
                var group = (app.state_map.fetchId && app.GroupCollection.findWhere({
                            name: app.state_map.fetchId
                        }) ?
                        app.GroupCollection.findWhere({
                            name: app.state_map.fetchId
                        }) : new app.Group()),
                    editGroupUsersView = new app.EditGroupUsersView({
                        model: group
                    });

                app.router.AppView.showView(editGroupUsersView);
            };
        } else if (name) {
            var user = (app.GroupCollection.findWhere({
                        name: app.state_map.fetchId
                    }) ?
                    app.GroupCollection.findWhere({
                        name: app.state_map.fetchId
                    }) : new app.Group()),
                editGroupUsersView = new app.EditGroupUsersView({
                    model: group
                });

            app.router.AppView.showView(editGroupUsersView);
        } else {
            var editGroupUsersView = new app.EditGroupUsersView({
                model: new app.Group()
            });

            this.AppView.showView(editGroupUsersView);
        }
    },

    onRouteChange: function (route, params) {
        //parse out hash
        var hashRoute = window.location.hash.substring(1),
        routePathArr = hashRoute.split('/'), breadcrumb,
        i, j, href = '#',
        $breadcrumbs = $('.breadcrumbs');

        $breadcrumbs.children().not('.home').remove();

        if(route == 'error'){
            return;
        }

        for(i = 0; i < routePathArr.length; i++){
            breadcrumb = routePathArr[i];
            if(breadcrumb == ''){
                continue;
            }
            href += breadcrumb + '/';
            $breadcrumbs.append('<li class="' + (i == routePathArr.length - 1 ? 'current' : '' ) +'"><a href="'+href+'">' + breadcrumb + '</a></li>');
        }
    }
});


app.router = new Router({
    AppView: app.AppView
});

Backbone.history.start();
