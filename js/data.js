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

app.data = (function(){
	var stateMap = {
		dataArr: [],
		currentDataArrIndex: 0
	},
	printError, getPermissions, getUsers, addUserToGroup, removeUserFromGroup, modifyPermissions, removeUserFromWeb;

   // Begin Utility Method /printError/
    printError = function (XMLHttpRequest, textStatus, errorThrown) {
        console.log("There was an error: " + errorThrown + " " + textStatus);
        console.log(XMLHttpRequest.responseText);
    };
    // End Utility Method /printError/

    // Begin Utility Method /getPermissions/
    //returns an object of all permissions and
    //their values equal to whether or not the user has
    //the permission
    getPermissions = function (url, username, callback) {
        var results = [], soapEnv, body, soapAction;

        username = username.replace('/', '\\');

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

        //data calls assume url ends with '/'
        //fix url if it dosn't end with '/'
        if(!url.endsWith('/')){
            url = url + '/';
        }

        $.ajax({
            url: url + "_vti_bin/UserGroup.asmx",
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
                } 
            },
            complete: function (xData, status) {
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
    getUsers = function (url, callback) {
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
        if(!url.endsWith('/')){
            url = url + '/';
        }


        $.ajax({
            url: url + "_vti_bin/UserGroup.asmx",
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
                    callback({type: 'error', data: {status: textStatus, error: errorThrown}});
                }
            },
            complete: function (xData, status) {
                results = $(xData.responseText).find("user");

                if (callback) {
                    callback(results);
                }
            },
            contentType: "text/xml; charset=\"utf-8\""
        });
    };
    // End Utility Method /getUsers/
      // Begin Utility Method /modifyPermissions/
    modifyPermissions = function (permissionArr, index, user, url, operation, callback) {
        var permission;

        if (!(permissionArr instanceof Array)) {
            return false;
        }
        if (index < permissionArr.length) {
            permission = permissionArr[index];
            index++;
            switch (operation) {
                case 'add':
                    addUserToGroup(url, permission, user, function (results) {
                        if(callback){
                             callback({ operation: operation, type: results.type, data: results.data, permission: permission });
                        }
                        modifyPermissions(permissionArr, index, user, url, operation, callback);
                    });
                    break;
                case 'remove':
                    removeUserFromGroup(url, permission, user, function (results) {
                       if(callback){
                             callback({ operation: operation, type: results.type, data: results.data, permission: permission });
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
    // Begin Utility Method /addUserToGroup/
    addUserToGroup = function (url, groupName, user, callback) {
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
                            <groupName>'+ groupName + '</groupName>\
                            <userName>'+ name + '</userName>\
                            <userLoginName>'+ login + '</userLoginName>\
                            <userEmail>'+ email + '</userEmail>\
                            <userNotes>' + description + '</userNotes>\
                        </AddUserToGroup>\
                    </soap:Body>\
                </soap:Envelope>';
         //data calls assume url ends with '/'
        //fix url if it dosn't end with '/'
        if(!url.endsWith('/')){
            url = url + '/';
        }

        $.ajax({
            url: url + "_vti_bin/UserGroup.asmx",
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
                }
            },
            complete: function (xData, status) {
                if (callback) {
                    callback({type: (status != 'error' ? 'success' : 'error'), data: xData});
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
           login = user.loginname.replace('/', '\\'),
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

                    //data calls assume url ends with '/'
        //fix url if it dosn't end with '/'
        if(!url.endsWith('/')){
            url = url + '/';
        }


        $.ajax({
            url: url + "_vti_bin/UserGroup.asmx",
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
                } 
            },
            complete: function (xData, status) {
                if (callback) {
                     callback({type: (status != 'error' ? 'success' : 'error'), data: xData});
                }
            },
            contentType: "text/xml; charset=\"utf-8\""
        });
    };
    // End Utility Method /removeUserFromGroup/

    // Begin utility method /removeUserFromWeb/
    removeUserFromWeb = function (url, user, callback) {
        var results = [],
            login = user.loginname.replace('/', '\\'),
            // Create the SOAP request
             soapEnv =
                '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
                    <soap:Body>\
                        <RemoveUserFromSite xmlns="http://schemas.microsoft.com/sharepoint/soap/directory/">\
                            <userLoginName>'+ login + '</userLoginName>\
                        </RemoveUserFromSite>\
                    </soap:Body>\
                </soap:Envelope>';

        //data calls assume url ends with '/'
        //fix url if it dosn't end with '/'
        if(!url.endsWith('/')){
            url = url + '/';
        }


        $.ajax({
            url: url + "_vti_bin/UserGroup.asmx",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('SOAPAction', "http://schemas.microsoft.com/sharepoint/soap/directory/RemoveUserFromSite");
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
                }
            },
            complete: function (xData, status) {
                if (callback) {
                    callback({type: (status != 'error' ? 'success' : 'error'), data: xData});
                }
            },
            contentType: "text/xml; charset=\"utf-8\""
        });
    };
    // End Utility Method /removeUserFromWeb/

	return {
		getPermissions: getPermissions,
        getUsers: getUsers, 
        addUserToGroup: addUserToGroup,
        removeUserFromGroup: removeUserFromGroup, 
        removeUserFromWeb: removeUserFromWeb,
        modifyPermissions: modifyPermissions
	};
})();

String.prototype.endsWith = function(suffix){
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
}