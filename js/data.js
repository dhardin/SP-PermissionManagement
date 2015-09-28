//our data module allows us to take in an array of objects 
//which will each reference a list and view GUID.
//
//The module processes each object linearly and then
//returns the results which is stored in the object.
//
//When a result is returned, a callback function is called on the result
//and each callback is also stored in the calling object.  This allows for us to
//process the results asynchronously.
//
var app = app || {};

if(app.config.testing){
app.data = (function() {
    var stateMap = {
            dataArr: [],
            currentDataArrIndex: 0
        },
        printError, getPermissions, getUsers, addUserToGroup, removeUserFromGroup, modifyPermissions, removeUserFromWeb;

    // Begin Utility Method /printError/
    printError = function(XMLHttpRequest, textStatus, errorThrown) {
        console.log("There was an error: " + errorThrown + " " + textStatus);
        console.log(XMLHttpRequest.responseText);
    };
    // End Utility Method /printError/

    // Begin Utility Method /getPermissions/
    //returns an object of all permissions and
    //their values equal to whether or not the user has
    //the permission
    getPermissions = function(url, username, callback) {
        var results = [],
            soapEnv, body, soapAction;

        username = username.replace('/', '\\');

        if (username) {
            body = '<GetGroupCollectionFromUser xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/">\
                        <userLoginName>' + username + '</userLoginName>\
                      </GetGroupCollectionFromUser>';
            soapAction = "http://schemas.microsoft.com/sharepoint/soap/directory/GetGroupCollectionFromUser";
        } else {
            body = ' <GetGroupCollectionFromSite xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/" />';
            soapAction = "http://schemas.microsoft.com/sharepoint/soap/directory/GetGroupCollectionFromSite";
        }

        soapEnv =
            '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
                     <soap:Body>\
                    ' + body + '\
                    </soap:Body>\
                </soap:Envelope>';

        //data calls assume url ends with '/'
        //fix url if it dosn't end with '/'
        if (!app.utility.endsWith(url, '/')) {
            url = url + '/';
        }

        $.ajax({
            url: url + "_vti_bin/UserGroup.asmx",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('SOAPAction', soapAction);
            },
            type: "POST",
            dataType: "xml",
            data: soapEnv,
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                printError(XMLHttpRequest, textStatus, errorThrown)
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                }
            },
            complete: function(xData, status) {
                results = $(xData.responseText).find("group");

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
    getUsers = function(url, callback) {
        var results = [],

            // Create the SOAP request
            soapEnv =
            '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
                <soap:Body>\
                  <GetUserCollectionFromSite xmlns="http://schemas.microsoft.com/sharepoint/soap/" />\
                </soap:Body>\
            </soap:Envelope>';

        //data calls assume url ends with '/'
        //fix url if it dosn't end with '/'
        if (!app.utility.endsWith(url, '/')) {
            url = url + '/';
        }


        $.ajax({
            url: url + "_vti_bin/UserGroup.asmx",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('SOAPAction', "http://schemas.microsoft.com/sharepoint/soap/directory/GetUserCollectionFromSite");
            },
            type: "POST",
            dataType: "xml",
            data: soapEnv,
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                printError(XMLHttpRequest, textStatus, errorThrown)
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                } else if (callback) {
                    callback({
                        type: 'error',
                        data: {
                            status: textStatus,
                            error: errorThrown
                        }
                    });
                }
            },
            complete: function(xData, status) {
                results = $(xData.responseText).find("user");

                if (callback) {
                    callback(results);
                }
            },
            contentType: "text/xml; charset=\"utf-8\""
        });
    };
    // End Utility Method /getUsers/

    // Begin utility method /getUsersFromGroup/
    // Begin Utility Method /getUsers/
    //returns a list of users from a site
    getUsersFromGroup = function(url, group, callback) {
        var results = [],

            // Create the SOAP request
            soapEnv =
            '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
                <soap:Body>\
                   <GetUserCollectionFromGroup xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/">\
                    <groupName>' + group + '</groupName>\
                  </GetUserCollectionFromGroup>\
              </soap:Body>\
            </soap:Envelope>';

        //data calls assume url ends with '/'
        //fix url if it dosn't end with '/'
        if (!app.utility.endsWith(url, '/')) {
            url = url + '/';
        }

        $.ajax({
            url: url + "_vti_bin/UserGroup.asmx",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('SOAPAction', "http://schemas.microsoft.com/sharepoint/soap/directory/GetUserCollectionFromGroup");
            },
            type: "POST",
            dataType: "xml",
            data: soapEnv,
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                printError(XMLHttpRequest, textStatus, errorThrown)
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                } else if (callback) {
                    callback({
                        type: 'error',
                        data: {
                            status: textStatus,
                            error: errorThrown
                        }
                    });
                }
            },
            complete: function(xData, status) {
                results = $(xData.responseText).find("user");

                if (callback) {
                    callback(results);
                }
            },
            contentType: "text/xml; charset=\"utf-8\""
        });
    };
    // End Utility Method /getUsers/
    // End utility method /getUsersFromGroup/
    // Begin Utility Method /modifyPermissions/
    modifyPermissions = function(permissionArr, index, user, url, operation, callback) {
        var permission;

        if (!(permissionArr instanceof Array)) {
            return false;
        }
        if (index < permissionArr.length) {
            permission = permissionArr[index];
            index++;
            switch (operation) {
                case 'add':
                    addUserToGroup(url, permission, user, function(results) {
                        if (callback) {
                            callback({
                                operation: operation,
                                type: results.type,
                                data: results.data,
                                permission: permission
                            });
                        }
                        modifyPermissions(permissionArr, index, user, url, operation, callback);
                    });
                    break;
                case 'remove':
                    removeUserFromGroup(url, permission, user, function(results) {
                        if (callback) {
                            callback({
                                operation: operation,
                                type: results.type,
                                data: results.data,
                                permission: permission
                            });
                        }
                        modifyPermissions(permissionArr, index, user, url, operation, callback);
                    });
                    break;
                default:
                    break;
            }

        }

    };
    // End Utility method /modifyPermissions/

    // Begin Utility Method /modifyUsers/
    modifyUsers = function(userArr, index, group, url, operation, callback) {
        var user, groupName = group.name;

        if (!(userArr instanceof Array)) {
            return false;
        }
        if (index < userArr.length) {
            user = userArr[index];
            index++;
            switch (operation) {
                case 'add':
                    addUserToGroup(url, groupName, user, function(results) {
                        if (callback) {
                            callback({
                                operation: operation,
                                type: results.type,
                                data: results.data,
                                user: user.name
                            });
                        }
                        modifyUsers(userArr, index, group, url, operation, callback);
                    });
                    break;
                case 'remove':
                    removeUserFromGroup(url, groupName, user, function(results) {
                        if (callback) {
                            callback({
                                operation: operation,
                                type: results.type,
                                data: results.data,
                                user: user.name
                            });
                        }
                        modifyUsers(userArr, index, group, url, operation, callback);
                    });
                    break;
                default:
                    break;
            }

        }

    };
    // End Utility method /modifyUsers/

    // Begin Utility Method /addUserToGroup/
    addUserToGroup = function(url, groupName, user, callback) {
        var results = [],
            groupName = groupName,
            name = user.name,
            login = user.loginname.replace('/', '\\'),
            email = user.email,
            description = user.description || '',
            // Create the SOAP request
            soapEnv =
            '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
                    <soap:Body>\
                        <AddUserToGroup xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/">\
                            <groupName>' + groupName + '</groupName>\
                            <userName>' + name + '</userName>\
                            <userLoginName>' + login + '</userLoginName>\
                            <userEmail>' + email + '</userEmail>\
                            <userNotes>' + description + '</userNotes>\
                        </AddUserToGroup>\
                    </soap:Body>\
                </soap:Envelope>';
        //data calls assume url ends with '/'
        //fix url if it dosn't end with '/'
        if (!app.utility.endsWith(url, '/')) {
            url = url + '/';
        }

        $.ajax({
            url: url + "_vti_bin/UserGroup.asmx",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('SOAPAction', "http://schemas.microsoft.com/sharepoint/soap/directory/AddUserToGroup");
            },
            type: "POST",
            dataType: "xml",
            data: soapEnv,
            tryCount: 0,
            retryLimit: 0,
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                printError(XMLHttpRequest, textStatus, errorThrown)
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                }
            },
            complete: function(xData, status) {
                if (callback) {
                    callback({
                        type: (status != 'error' ? 'success' : 'error'),
                        data: xData
                    });
                }
            },
            contentType: "text/xml; charset=\"utf-8\""
        });
    };
    // End Utility Method /addUserToGroup/

    // Begin utility method /removeUserFromGroup/
    removeUserFromGroup = function(url, groupName, user, callback) {
        var results = [],
            groupName = groupName,
            login = user.loginname.replace('/', '\\'),
            // Create the SOAP request
            soapEnv =
            '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
                    <soap:Body>\
                        <RemoveUserFromGroup xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/">\
                            <groupName>' + groupName + '</groupName>\
                            <userLoginName>' + login + '</userLoginName>\
                        </RemoveUserFromGroup>\
                    </soap:Body>\
                </soap:Envelope>';

        //data calls assume url ends with '/'
        //fix url if it dosn't end with '/'
        if (!app.utility.endsWith(url, '/')) {
            url = url + '/';
        }


        $.ajax({
            url: url + "_vti_bin/UserGroup.asmx",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('SOAPAction', "http://schemas.microsoft.com/sharepoint/soap/directory/RemoveUserFromGroup");
            },
            type: "POST",
            dataType: "xml",
            data: soapEnv,
            tryCount: 0,
            retryLimit: 0,
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                printError(XMLHttpRequest, textStatus, errorThrown)
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                }
            },
            complete: function(xData, status) {
                if (callback) {
                    callback({
                        type: (status != 'error' ? 'success' : 'error'),
                        data: xData
                    });
                }
            },
            contentType: "text/xml; charset=\"utf-8\""
        });
    };
    // End Utility Method /removeUserFromGroup/

    // Begin utility method /removeUserFromWeb/
    removeUserFromWeb = function(url, user, callback) {
        var results = [],
            login = user.loginname.replace('/', '\\'),
            // Create the SOAP request
            soapEnv =
            '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
                    <soap:Body>\
                        <RemoveUserFromSite xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/">\
                            <userLoginName>' + login + '</userLoginName>\
                        </RemoveUserFromSite>\
                    </soap:Body>\
                </soap:Envelope>';

        //data calls assume url ends with '/'
        //fix url if it dosn't end with '/'
        if (!app.utility.endsWith(url, '/')) {
            url = url + '/';
        }


        $.ajax({
            url: url + "_vti_bin/UserGroup.asmx",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('SOAPAction', "http://schemas.microsoft.com/sharepoint/soap/directory/RemoveUserFromSite");
            },
            type: "POST",
            dataType: "xml",
            data: soapEnv,
            tryCount: 0,
            retryLimit: 0,
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                printError(XMLHttpRequest, textStatus, errorThrown)
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                }
            },
            complete: function(xData, status) {
                if (callback) {
                    callback({
                        type: (status != 'error' ? 'success' : 'error'),
                        data: xData
                    });
                }
            },
            contentType: "text/xml; charset=\"utf-8\""
        });
    };
    // End Utility Method /removeUserFromWeb/

    // Begin utility method /updateGroupInfo/
    updateGroupInfo = function(url, options, callback) {
        var results = [],
            updates = "",
            soapEnv = "";
        if (!options) {
            return false;
        }

        updates += '<oldGroupName>' + options.oldGroupName + '</oldGroupName>' + '<groupName>' + options.name + '</groupName>' + '<ownerIdentifier>' + options.ownerIdentifier + '</ownerIdentifier>' + '<ownerType>' + options.ownerType + '</ownerType>' + '<description>' + options.description + '</description>';

        // Create the SOAP request
        soapEnv =
            '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
                    <soap:Body>\
                        <UpdateGroupInfo xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/">\
                           ' + updates + '\
                        </UpdateGroupInfo>\
                    </soap:Body>\
                </soap:Envelope>';

        //data calls assume url ends with '/'
        //fix url if it dosn't end with '/'
        if (!app.utility.endsWith(url, '/')) {
            url = url + '/';
        }


        $.ajax({
            url: url + "_vti_bin/UserGroup.asmx",
            beforeSend: function(xhr) {
                xhr.setRequestHeader('SOAPAction', "http://schemas.microsoft.com/sharepoint/soap/directory/UpdateGroupInfo");
            },
            type: "POST",
            dataType: "xml",
            data: soapEnv,
            tryCount: 0,
            retryLimit: 0,
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                printError(XMLHttpRequest, textStatus, errorThrown)
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                }
            },
            complete: function(xData, status) {
                if (callback) {
                    callback({
                        type: (status != 'error' ? 'success' : 'error'),
                        data: xData,
                        updates: options
                    });
                }
            },
            contentType: "text/xml; charset=\"utf-8\""
        });
    };
    // End utility method /updateGroupInfo/

    // Begin utility method /getCurrentUser/
    getCurrentUser = function(url, callback) {
        var type;

        //data calls assume url ends with '/'
        //fix url if it dosn't end with '/'
        if (!app.utility.endsWith(url, '/')) {
            url = url + '/';
        }

        // Get the UserDisp.aspx page using AJAX
        $.ajax({
            // Force parameter forces redirection to a page that displays the information as stored in the UserInfo table rather than My Site.
            // Adding the extra Query String parameter with the current date/time forces the server to view this as a new request.
            url: url + "_layouts/userdisp.aspx?Force=True&" + new Date().getTime(),
            type: "POST",
            dataType: "xml",
            complete: function(xData, status) {
                type = (status != 'error' ? 'success' : 'error');
                if (type == 'success') {
                    _processUserFields(xData, callback);
                } else if (callback) {
                    callback({
                        data: xData,
                        type: type
                    });
                }
            }
        });
    };
    // End utility method /getCurrentUser/

    // Begin utility method /_processUserFields/
    _processUserFields = function(xData, callback) {
            var opt = $.extend({}, {
                    webURL: "", // URL of the target Site Collection. If not specified, the current Web is used.
                    fieldName: "Name", // Specifies which field to return from the userdisp.aspx page
                    fieldNames: {},
                    // Specifies which fields to return from the userdisp.aspx page - added in v0.7.2 to allow multiple columns
                    debug: false // If true, show error messages; if false, run silent
                }, {}),
                thisField = "",
                theseFields = {},
                fieldCount = opt.fieldNames.length > 0 ? opt.fieldNames.length : 1;


            for (i = 0; i < fieldCount; i++) {
                var thisTextValue;
                if (fieldCount > 1) {
                    thisTextValue = RegExp(
                        "FieldInternalName=\"" + opt.fieldNames[i] + "\"", "gi");
                } else {
                    thisTextValue = RegExp(
                        "FieldInternalName=\"" + opt.fieldName + "\"", "gi");
                }

                $(xData.responseText).find(
                    "table.ms-formtable td[id^='SPField']").each(function() {
                    if (thisTextValue.test($(this).html())) {
                        // Each fieldtype contains a different data type, as indicated by the id
                        switch ($(this).attr("id")) {
                            case "SPFieldText":
                                thisField = $(
                                    this).text();
                                break;
                            case "SPFieldNote":
                                thisField = $(
                                    this).find("div").html();
                                break;
                            case "SPFieldURL":
                                thisField = $(
                                    this).find("img").attr("src");
                                break;
                                // Just in case
                            default:
                                thisField = $(
                                    this).text();
                                break;
                        }
                        // Stop looking; we're done
                        return false;
                    }
                });
                if (opt.fieldNames[i] !== "ID") {
                    thisField = (
                        typeof thisField !== "undefined") ? thisField.replace(/(^[\s\xA0]+|[\s\xA0]+$)/g, '') : null;
                }

                if (fieldCount > 1) {
                    theseFields[opt.fieldNames[i]] = thisField;
                }
            }

            if (callback) {
                callback({
                    data: (fieldCount > 1 ? theseFields : thisField),
                    type: 'success'
                });
            }
        }
        // End utility method /_processUserFields/
    return {
        getPermissions: getPermissions,
        getUsers: getUsers,
        getUsersFromGroup: getUsersFromGroup,
        addUserToGroup: addUserToGroup,
        removeUserFromGroup: removeUserFromGroup,
        removeUserFromWeb: removeUserFromWeb,
        modifyPermissions: modifyPermissions,
        modifyUsers: modifyUsers,
        updateGroupInfo: updateGroupInfo,
        getCurrentUser: getCurrentUser
    };
})();
} else {
    app.data = (function() {
    var stateMap = {
            dataArr: [],
            currentDataArrIndex: 0
        },
        getPermissions, getUsers, addUserToGroup, removeUserFromGroup, modifyPermissions, removeUserFromWeb;


    // Begin Utility Method /getPermissions/
    //returns an object of all permissions and
    //their values equal to whether or not the user has
    //the permission
    getPermissions = function(url, username, callback) {
        return app.UserCollection.fineWhere({loginname: userName});
    };
    // End Utility Method /getPermissions/

    // Begin Utility Method /getUsers/
    //returns a list of users from a site
    getUsers = function(url, callback) {
        return app.UserCollection.models;
    };
    // End Utility Method /getUsers/

    // Begin utility method /getUsersFromGroup/
    // Begin Utility Method /getUsers/
    //returns a list of users from a site
    getUsersFromGroup = function(url, group, callback) {
        return app.GroupCollection.findWhere({name: group});
    };
    // End Utility Method /getUsers/
    // End utility method /getUsersFromGroup/
    // Begin Utility Method /modifyPermissions/
    modifyPermissions = function(permissionArr, index, user, url, operation, callback) {

    };
    // End Utility method /modifyPermissions/

    // Begin Utility Method /modifyUsers/
    modifyUsers = function(userArr, index, group, url, operation, callback) {

    };
    // End Utility method /modifyUsers/

    // Begin Utility Method /addUserToGroup/
    addUserToGroup = function(url, groupName, user, callback) {

    };
    // End Utility Method /addUserToGroup/

    // Begin utility method /removeUserFromGroup/
    removeUserFromGroup = function(url, groupName, user, callback) {

    };
    // End Utility Method /removeUserFromGroup/

    // Begin utility method /removeUserFromWeb/
    removeUserFromWeb = function(url, user, callback) {

    };
    // End Utility Method /removeUserFromWeb/

    // Begin utility method /updateGroupInfo/
    updateGroupInfo = function(url, options, callback) {

    };
    // End utility method /updateGroupInfo/

    // Begin utility method /getCurrentUser/
    getCurrentUser = function(url, callback) {
    };
    // End utility method /getCurrentUser/

  
    return {
        getPermissions: getPermissions,
        getUsers: getUsers,
        getUsersFromGroup: getUsersFromGroup,
        addUserToGroup: addUserToGroup,
        removeUserFromGroup: removeUserFromGroup,
        removeUserFromWeb: removeUserFromWeb,
        modifyPermissions: modifyPermissions,
        modifyUsers: modifyUsers,
        updateGroupInfo: updateGroupInfo,
        getCurrentUser: getCurrentUser
    };
})();
}