/*
 * sp-permissions.js
 * Root namespace module
*/

/*jslint          browser : true,     continue : true,
  devel   : true,  indent : 2,        maxerr   : 50,
  newcapp : true,   nomen : true,     plusplus : true,
  regexp  : true,  sloppy : true,         vars : false,
  white   : true
*/
/*global $, spPermissions */

var spPermissions = (function () {
    //----------------- BEGIN MODULE SCOPE VARIABLES ---------------
    var
        config_map = {
            main_html: String() 
                + '<div class="sp-permission-container">'
                    + '<h1><span class="lock glyphicon glyphicon-lock"></span> Permission Management</h1>'
                    + 'Select a user: <div class="users"></div>'
                    + '<div class="userInfo">'
                        + '<table>'
                            + '<tr>'
                                + '<td>Display Name: </td>'
                                + '<td><input class="user-name" type="text" /></td>'
                            + '</tr>'
                            + '<tr>'
                                + '<td>Username: </td>'
                                + '<td><input class="user-username" type="text" /></td>'
                            + '</tr>'
                            + '<tr>'
                                + '<td>Email: </td>'
                                + '<td><input class="user-email" type="text" /></td>'
                            + '</tr>'
                        + '</table>'
                        + '<button type="button" class="get-permissions-btn btn btn-primary">'
                            + 'Get Permissions'
                        + '</button>'
                        + '<button type="button" class="save-permissions-btn btn btn-primary">'
                            + 'Save Permissions'
                        + '</button>'
                        + '<div class="notify alert alert-info" role="alert">'
                         + '<span class="message"></span>'
                         + '<div class="results well"></div>'
                         + '<div class="progress">'
                            + '<div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>'
                         + '</div>'
                        + '</div>'
                    + '</div>'
                    + '<select class="permissions" multiple="multiple"></select>'
                + '</div>',
            settings_map : {
                url: true,
                height: true
            },
            dom_map : {
                progress_bar: ''
            },
            notification_map : {
                wait: '<Strong>Please wait...</Strong>',
                save: '<Strong>Saving </Strong>',
                error: '<Strong>Error!</Strong>',
                complete: '<Strong>Complete!</Strong>'
            },
            alert_map : {
                success: 'alert-success',
                info: 'alert-info',
                warning: 'alert-warning',
                danger: 'alert-danger'
            }
        },
        state_map = {
            $container: null,
            $main: null,
            userArr : [],
            userPermissions: {},
            newPermissions : {},
            permSelect: [],
            totalPermissions: 0,
            pendingSaves: 0,
            pendingRemoves: 0,
            totalUpdates: 0,
            progressUpdateRatio: 0,
            currentProgress: 0,
            failed: {
                add: [],
                remove: []
            },
            success: {
                add: [],
                remove: []
            }
        },
        settings_map = {
            url: "",
            height: 300
        },
        jqueryMap = {},
        initModule, initSelect2, setJqueryMap, getData, getWebs, getLists, printError, addUser, addPermission,
        getPermissions, getUsers, addUserToGroup, removeUserFromGroup, modifyPermissions, format,
        changeAlert, completeModifyPermission, populatePermissions, onUserChange, onGetBtnClick, onSaveBtnClick,

    //----------------- END MODULE SCOPE VARIABLES ---------------
    //----------------- BEGIN UTILITY METHODS --------------------
    // Begin Utility Method /format/
    format = function (item) {
        return item.name;
    }
    // End Utility Method /format/

    // Begin Utility Method /printError/
    printError = function (XMLHttpRequest, textStatus, errorThrown) {
        console.log("There was an error: " + errorThrown + " " + textStatus);
        console.log(XMLHttpRequest.responseText);
    };
    // End Utility Method /printError/

    // Begin Utility Method /addUser/
    addUser = function (arr, max, index, callback) {
        var name, email, login;

        name = arr[index].name;
        email = arr[index].email;
        login = arr[index].login;

        $('<li> ' + name + '</li>').appendTo(jqueryMap.$users);

        index++;
        if (index < max) {
            setTimeout(function () {
                addUser(arr, max, index, callback);
            }, 10);

        } else if (callback) {
            callback();
        }
    };
    // End Utility Method /addUser/

    // Begin Utility Method /addPermission/
    addPermission = function ($target, arr, max, index, callback) {
        var name, email;

        name = arr[index].name;
        description = arr[index].description;

        $('<Option value=' + name.replace(/\s/g, '_') + '>' + name + '</Option>').appendTo($target);

        index++;
        if (index < max) {
            setTimeout(function () {
                addPermission($target, arr, max, index, callback);
            }, 10);

        } else if (callback) {
            callback();
        }
    };
    // End Utility Method /addPermission/


    // Begin Utility Method /getPermissions/
    //returns an object of all permissions and
    //their values equal to whether or not the user has
    //the permission
    getPermissions = function (url, username, callback) {
        var results = [], soapEnv, body, soapAction;

        if (username) {
            body = '<GetGroupCollectionFromUser xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/">\
                        <userLoginName>'+ username + '</userLoginName>\
                      </GetGroupCollectionFromUser>';
            soapAction = "http://schemas.microsoft.com/sharepoint/soap/directory/GetGroupCollectionFromUser";
        } else {
            body = ' <GetGroupCollectionFromSite xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/" />';
            soapAction = "http://schemas.microsoft.com/sharepoint/soap/directory/GetGroupCollectionFromSite";
        }

        soapEnv =
          '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
                     <soap:Body>\
                    '+ body + '\
                    </soap:Body>\
                </soap:Envelope>';



        $.ajax({
            url: url + "/_vti_bin/UserGroup.asmx",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('SOAPAction', soapAction);
            },
            type: "POST",
            dataType: "xml",
            data: soapEnv,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                printError(XMLHttpRequest, textStatus, errorThrown)
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                } else if (callback) {
                    callback(textStatus);
                }
            },
            complete: function (xData, status) {
                $(xData.responseText).find("group").each(function () {
                    var $this = $(this)[0],
                    name, description;

                    name = $this.getAttribute('name');
                    description = $this.getAttribute('description');
                    results.push({ name: name, description: description });
                });

                if (callback) {
                    callback(results);
                }
            },
            contentType: "text/xml; charset=\"utf-8\""
        });
    };
    // End Utility Method /getPermissions/

    // Begin Utility Method /getUsers/
    //returns a list of users from a site
    getUsers = function (url, callback) {
        var results = [],

        // Create the SOAP request
         soapEnv =
            '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
                <soap:Body>\
                  <GetUserCollectionFromSite xmlns="http://schemas.microsoft.com/sharepoint/soap/" />\
                </soap:Body>\
            </soap:Envelope>';


        $.ajax({
            url: url + "/_vti_bin/UserGroup.asmx",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('SOAPAction', "http://schemas.microsoft.com/sharepoint/soap/directory/GetUserCollectionFromSite");
            },
            type: "POST",
            dataType: "xml",
            data: soapEnv,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                printError(XMLHttpRequest, textStatus, errorThrown)
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                } else if (callback) {
                    callback(textStatus);
                }
            },
            complete: function (xData, status) {
                $(xData.responseText).find("user").each(function () {
                    var $this = $(this)[0],
                    name, email, login;

                    name = $this.getAttribute('name');
                    email = $this.getAttribute('email');
                    login = $this.getAttribute('loginname');

                    results.push({ name: name, email: email, login: login });
                });

                if (callback) {
                    callback(results);
                }
            },
            contentType: "text/xml; charset=\"utf-8\""
        });
    };
    // End Utility Method /getUsers/

    // Begin Utility Method /addUserToGroup/
    addUserToGroup = function (url, groupName, user, callback) {
        var results = [],
            groupName = groupName,
            name = user.name,
            login = user.login,
            email = user.email,
            description = user.description || '',
            // Create the SOAP request
             soapEnv =
                '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
                    <soap:Body>\
                        <AddUserToGroup xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/">\
                            <groupName>'+ groupName + '</groupName>\
                            <userName>'+ name + '</userName>\
                            <userLoginName>'+ login + '</userLoginName>\
                            <userEmail>'+ email + '</userEmail>\
                            <userNotes>' + description + '</userNotes>\
                        </AddUserToGroup>\
                    </soap:Body>\
                </soap:Envelope>';


        $.ajax({
            url: url + "/_vti_bin/UserGroup.asmx",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('SOAPAction', "http://schemas.microsoft.com/sharepoint/soap/directory/AddUserToGroup");
            },
            type: "POST",
            dataType: "xml",
            data: soapEnv,
            tryCount: 0,
            retryLimit: 0,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                printError(XMLHttpRequest, textStatus, errorThrown)
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                } else if (callback) {
                    callback({ status: textStatus });
                }
            },
            complete: function (xData, status) {
                if (callback) {
                    callback({ groupName: groupName, status: status });
                }
            },
            contentType: "text/xml; charset=\"utf-8\""
        });
    };
    // End Utility Method /addUserToGroup/

    // Begin utility method /removeUserFromGroup/
    removeUserFromGroup = function (url, groupName, user, callback) {
        var results = [],
            groupName = groupName,
            login = user.login,
            // Create the SOAP request
             soapEnv =
                '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
                    <soap:Body>\
                        <RemoveUserFromGroup xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/">\
                            <groupName>'+ groupName + '</groupName>\
                            <userLoginName>'+ login + '</userLoginName>\
                        </RemoveUserFromGroup>\
                    </soap:Body>\
                </soap:Envelope>';


        $.ajax({
            url: url + "/_vti_bin/UserGroup.asmx",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('SOAPAction', "http://schemas.microsoft.com/sharepoint/soap/directory/RemoveUserFromGroup");
            },
            type: "POST",
            dataType: "xml",
            data: soapEnv,
            tryCount: 0,
            retryLimit: 0,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                printError(XMLHttpRequest, textStatus, errorThrown)
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                } else if (callback) {
                    callback({ status: textStatus });
                }
            },
            complete: function (xData, status) {
                if (callback) {
                    callback({ groupName: groupName, status: status });
                }
            },
            contentType: "text/xml; charset=\"utf-8\""
        });
    };
    // End Utility Method /removeUserFromGroup/

    // Begin Utility Method /modifyPermissions/
    modifyPermissions = function (permissionArr, index, user, url, operation, callback) {
        var permission;
        if (!(permissionArr instanceof Array)) {
            return false;
        }
        if (index < permissionArr.length) {
            permission = permissionArr[index].replace(/_/g, ' ');
            index++;
            switch (operation) {
                case 'add':
                    addUserToGroup(url, permission, user, function (results) {
                        completeModifyPermission({ operation: operation, status: results.status, permission: permission });
                        modifyPermissions(permissionArr, index, user, url, operation, callback);
                    });
                    break;
                case 'remove':
                    removeUserFromGroup(url, permission, user, function (results) {
                        completeModifyPermission({ operation: operation, status: results.status, permission: permission });
                        modifyPermissions(permissionArr, index, user, url, operation, callback);
                    });
                    break;
                default:
                    break;
            }

        } else if (callback) {
            callback();
        }

    }
    // End Utility method /modifyPermissions/

    //----------------- END UTILITY METHODS ----------------------
    //--------------------- BEGIN DOM METHODS --------------------
    // Begin DOM method /setJqueryMap/
    setJqueryMap = function () {
        var
        $container = state_map.$container,
        $main = state_map.$main;
        
        jqueryMap = {
            $container: $container,
            $main: $main,
            $users : $container.find('.users'),
            $permissions: $container.find('.permissions'),
            $progress: $container.find('.progress'),
            $progressBar: $container.find('.progress-bar'),
            $getPermissionsBtn: $container.find('.get-permissions-btn'),
            $savePermissionsBtn: $container.find('.save-permissions-btn'),
            $notify: $container.find('.notify'),
            $notifyMessage: $container.find('.message'),
            $results: $container.find('.results'),
            $username: $container.find('.user-username'),
            $name: $container.find('.user-name'),
            $email: $container.find('.user-email')
        };
    };
    // End DOM method /setJqueryMap/

    // Begin DOM method /changeAlert/
    changeAlert = function ($target, alert) {
        var alertKey;
        if (config_map.alert_map.hasOwnProperty(alert)) {
            $target.addClass(config_map.alert_map[alert]);
        }
        for (alertKey in config_map.alert_map) {
            if (alert != alertKey) {
                $target.removeClass(config_map.alert_map[alertKey]);
            }
        }
    }
    // End DOM mehtod /changeAlert/

    // Begin DOM method /completeModifyPermission/
    completeModifyPermission = function (result_map) {
        var operation = result_map.operation,
            status = result_map.status,
            permission = result_map.permission,
            notifyText = "";

        state_map.currentProgress += state_map.progressUpdateRatio;
        state_map.currentProgress = (state_map.currentProgress >= 100 ? 100 : state_map.currentProgress);
        jqueryMap.$progressBar.attr('aria-valuenow', state_map.currentProgress)
                      .css('width', state_map.currentProgress + '%')
                      .text(Math.floor(state_map.currentProgress) + '%');
        state_map.pendingRemoves -= (operation == 'remove' ? 1 : 0);
        state_map.pendingSaves -= (operation == 'add' ? 1 : 0);

        if (status == 'error') {
            state_map.failed[operation].push(permission);
            changeAlert(jqueryMap.$notify, "warning");
            jqueryMap.$notifyMessage.html((operation == 'add' ? '<Strong>Failed Save</Strong> ' : '<Strong>Failed Remove</Strong> ') + permission);

        } else {
            changeAlert(jqueryMap.$notify, "info");
            jqueryMap.$notifyMessage.html((operation == 'add' ? '<Strong>Saved</Strong> ' : '<Strong>Removed</Strong> ') + permission);
            state_map.success[operation].push(permission);
            //if (operation == 'add') {
            //    userPermissions[permission.replace(/\s/g, '_')] = true;
            //}
        }

        if (!state_map.pendingSaves && !state_map.pendingRemoves) {
            if (state_map.currentProgress < 100) {
                state_map.currentProgress = 100;
                jqueryMap.$progressBar.attr('aria-valuenow', state_map.currentProgress)
                              .css('width', state_map.currentProgress + '%')
                              .text(state_map.currentProgress + '%');
            }

            
           
            jqueryMap.$results.html(
                (state_map.failed.add.length > 0 ? '<Strong>Failed Saves</Strong> ' + state_map.failed.add.toString() + '\n' : '')
                + (state_map.failed.remove.length > 0 ? '<Strong>Failed Removes</Strong> ' + state_map.failed.remove.toString() : '')
                );

            state_map.pendingRemoves = 0;
            state_map.pendingSaves = 0;
            state_map.failed.add = [];
            state_map.failed.remove = [];
            state_map.success.add = [];
            state_map.success.remove = [];
            jqueryMap.$notifyMessage.html(config_map.notification_map.complete);

            if (state_map.failed.add.length > 0 || state_map.failed.remove.length > 0) {
                changeAlert(jqueryMap.$notify, "danger");
            } else {
                changeAlert(jqueryMap.$notify, "success");
            }

            //fade out and remove progress bar
            jqueryMap.$progress.fadeOut(2000, function () {
                if (state_map.failed.add.length > 0 || state_map.failed.remove.length > 0) {
                    jqueryMap.$results.show();
                }
            });
              
         
            jqueryMap.$savePermissionsBtn.prop('disabled', false);
            jqueryMap.$getPermissionsBtn.prop('disabled', false);
            jqueryMap.$getPermissionsBtn.click();
        }
    };
    // End DOM method /completeModifyPermission/

    // Begin DOM method /initSelect2/
    initSelect2 = function($target, arr){
        $target.select2({
            id: function (e) { return e.name + '|' + e.login + '|' + e.email },
            data: {
                results: arr,
                text: function (item) {
                    return item.name;
                },
                name: function (item) {
                    return item.name;
                },
                login: function (item) {
                    return item.login;
                },
                email: function (item) {
                    return item.email;
                }
            },
            formatSelection: format,
            formatResult: format
        });
    };
    // End DOM method /initSelect2/

    // Begin DOM method /populatePermissions/
    populatePermissions = function($target, arr){
        totalPermissions = arr.length;
        addPermission($target, arr, arr.length, 0, function () {
            permSelect = $target.bootstrapDualListbox({
                nonSelectedListLabel: 'Available Permissions',
                selectedListLabel: 'User Permissions',
                preserveSelectionOnMove: 'moved',
                moveOnSelect: false,
                nonSelectedFilter: '',
                selectorMinimalHeight: settings_map.height,
                callback: function () {
                    jqueryMap.$notifyMessage.html(config_map.notification_map.complete);
                    changeAlert(jqueryMap.$notify, "success");
                    //changes to swap out glypicons for html special characters
                    jqueryMap.$main.find('.moveall')
                        .html('Give All &rarr;&rarr;')
                        .addClass('btn-success')
                        .removeClass('btn-default');
                    jqueryMap.$main.find('.removeall')
                        .html('&larr;&larr; Remove All')
                        .addClass('btn-danger')
                        .removeClass('btn-default');
                    jqueryMap.$main.find('.move')
                        .html('Give Selected &rarr;')
                       .addClass('btn-success')
                       .removeClass('btn-default');
                    jqueryMap.$main.find('.remove')
                        .html('&larr; Remove Selected')
                       .addClass('btn-danger')
                       .removeClass('btn-default');
                    jqueryMap.$main.find('.filter').css({
                            'background': 'url("images/search.png") no-repeat right',
                            'background-size': '28px 28px'
                        });
                }
            });
        });
    };
    // End DOM method /populatePermissions/

    //--------------------- BEGIN EVENT HANDLERS ---------------
    onUserChange = function(e){
        var $this = $(this),
              name = $this.select2('data').name,
              email = $this.select2('data').email,
              login = $this.select2('data').login;

        jqueryMap.$name.val(name);
        jqueryMap.$email.val(email);
        jqueryMap.$username.val(login);
    }

    onGetBtnClick = function(e){
        userPermissions = {};
        getPermissions(settings_map.url, jqueryMap.$username.val(), function (results) {
            var newPerms = [];
            // addPermission($('.user-permissions'), results, results.length, 0, console.log('done!'));
            for (var i = 0; i < results.length; i++) {
                var name = results[i].name;
                name = name.replace(/\s/g, '_');
                newPerms.push(name);
                userPermissions[name] = true;
            }
            jqueryMap.$permissions.val(newPerms);
            jqueryMap.$permissions.bootstrapDualListbox('refresh');
            jqueryMap.$savePermissionsBtn.prop('disabled', false);
        });
    };

    onSaveBtnClick = function (e) {
        var permissions = jqueryMap.$permissions.val() || [],
            addPermissions = [],
            removePermissions = [],
            i, oldPermission,
            user = {
                name:  jqueryMap.$name.val(),
                email: jqueryMap.$email.val(),
                login: jqueryMap.$username.val(),
                description: $('.description').val()
            };

        state_map.currentProgress = 0;
        state_map.progressUpdateRatio = 0;
        state_map.totalUpdates = 0;

         

        //get permissions that the user wishes to remove
        //remove permissions
        i = 0;
        newPermissions = {};
        //determine permissions that the user is saving
        for (i = 0; i < permissions.length; i++) {
            newPermissions[permissions[i]] = true;
            if (!userPermissions.hasOwnProperty(permissions[i])) {
                addPermissions.push(permissions[i]);
            }
        }

        //determine permissions that the user is removing
        for (oldPermission in userPermissions) {
            i++;
            if (!newPermissions.hasOwnProperty(oldPermission)) {
                removePermissions.push(oldPermission);
            }
        }

        state_map.pendingSaves = addPermissions.length;
        state_map.pendingRemoves = removePermissions.length;
        state_map.totalUpdates = state_map.pendingRemoves + state_map.pendingSaves;
        state_map.progressUpdateRatio = 100 / state_map.totalUpdates;

        if (addPermissions.length > 0 || removePermissions.length > 0) {
            jqueryMap.$notifyMessage.html(config_map.notification_map.save);
            changeAlert(jqueryMap.$notify, "info");
            jqueryMap.$progressBar
                 .attr('aria-valuenow', 0)
                 .css('width', '0%');
            jqueryMap.$progress.show();
            jqueryMap.$results.fadeOut('slow');

            jqueryMap.$savePermissionsBtn.prop('disabled', true);
            jqueryMap.$getPermissionsBtn.prop('disabled', true);
        }
        //add permissions first
        modifyPermissions(addPermissions, 0, user, settings_map.url, 'add', function () {
            //once we complete adding permissions, go ahead and remove permissions
            modifyPermissions(removePermissions, 0, user, settings_map.url, 'remove');
        });
    };
    //--------------------- END EVENT HANLDERS -----------------

    //--------------------- END DOM METHODS --------------------

    initModule = function ($container, options) {
        var $main = $(config_map.main_html);

        settings_map.url = options.url || "";


        if (settings_map.url.length == 0) {
            return;
        }
        state_map.$main = $main;
        $main.appendTo($container);
        state_map.$container = $container;

        setJqueryMap();

        jqueryMap.$savePermissionsBtn.prop('disabled', true);
        changeAlert(jqueryMap.$notify, "info");
        jqueryMap.$notifyMessage.html(config_map.notification_map.wait);

        //Get users to populate select2 dropdown
        getUsers(settings_map.url, function (results) {
            initSelect2(jqueryMap.$users, results);
        });

        //get site collection permissions to populate dual list box
        getPermissions(settings_map.url, false, function (results) {
            populatePermissions(jqueryMap.$permissions, results);
        });


        jqueryMap.$users.on('change', onUserChange);

        jqueryMap.$getPermissionsBtn.on('click', onGetBtnClick);

        jqueryMap.$savePermissionsBtn.on('click', onSaveBtnClick);
    };

    return { initModule: initModule };

}());