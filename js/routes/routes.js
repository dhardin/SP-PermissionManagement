var app = app || {};

var Router = Backbone.Router.extend({
    routes: {
        '': 'selectEdit',
        'edit/user/:loginname': 'editUser',
        'edit/user/*': 'editUser',
        'edit/group/:name': 'editGroup',
        'edit/group/*': 'editGroup',
        'edit/*': 'selectEdit',
        'fetch': 'fetch',
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
    error: function() {
        var errorView = new app.ErrorView();
        app.router.AppView.showView(errorView);
    },
    fetch: function(){
        var fetchingDataView = new app.FetchingDataView();

        this.AppView.showView(fetchingDataView);
    },
    editUser: function(loginname) {
        var fetchingDataView, editUserPermissionView, user;

          app.state_map.fetchId = loginname || "";
      if (!app.state_map.fetched.editUser) {
            app.userEditFetchData();
        }

        if (app.state_map.fetchingData) {
            app.router.navigate('fetch', true);
            app.state_map.dataLoadCallback = function() {
                if (app.state_map.fetchId) {
                    app.router.navigate('edit/user/' + app.state_map.fetchId, true);
                } else {
                    app.router.navigate('edit/user/', true);
                }
            };
            return;
        } else if (loginname) {
          
            loginname = loginname.replace('\\', '/');
            user = app.UserCollection.findWhere({
                loginname: loginname
            });
            if (!user) {
                app.router.navigate('edit/user/', true);
                return;
            }
        } else {
            user = new app.User();
        }
        editUserPermissionView = new app.EditUserPermissionsView({
            model: user
        });

        this.AppView.showView(editUserPermissionView);
    },
    editGroup: function(name) {
        app.state_map.fetchId = (name != null ? name : "");
        if (app.config.isTesting) {
            app.setTestData('group');
        } else if (!app.state_map.fetched.editGroup) {
            app.groupEditFetchData();
        }
        app.state_map.fetchId = name || "";
        if (app.state_map.fetchingData) {
          
app.router.navigate('fetch', true);
            app.state_map.dataLoadCallback = function() {
                if (app.state_map.fetchId) {
                    app.router.navigate('edit/group/' + app.state_map.fetchId, true);
                } else {
                    app.router.navigate('edit/group/', true);
                }
            };
              return;
        } else if (name) {
            group = app.GroupCollection.findWhere({
                name: name
            });
            if (!group) {
                app.router.navigate('edit/group/', true);
            }
        } else {
            group = new app.Group();
        }
        var editGroupUsersView = new app.EditGroupUsersView({
            model: group
        });

        this.AppView.showView(editGroupUsersView);
    },

    onRouteChange: function(route, params) {
        //parse out hash
        var hashRoute = window.location.hash.substring(1),
            routePathArr = hashRoute.split('/'),
            breadcrumb,
            i, j, href = '#',
            $breadcrumbs = $('.breadcrumbs');

        $breadcrumbs.children().not('.home').remove();

        if (route == 'error') {
            return;
        }

        for (i = 0; i < routePathArr.length; i++) {
            breadcrumb = routePathArr[i];
            if (breadcrumb == '') {
                continue;
            }
            href += breadcrumb + '/';
            $breadcrumbs.append('<li class="' + (i == routePathArr.length - 1 ? 'current' : '') + '"><a href="' + href + '">' + breadcrumb + '</a></li>');
        }
    }
});


app.router = new Router({
    AppView: app.AppView
});

Backbone.history.start();
