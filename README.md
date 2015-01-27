#SP-PermissionManagement
=======================

An intuitive way to alter user permissions in SharePoint.


##Screenshot
![Permission Management Screenshot](https://raw.githubusercontent.com/dhardin/sp-permissionmanagement/master/user%20permissions.gif)

##Features
- Edit SharePoint user permissions
- Edit SharePoint group users
- Edit SharePoint group info
- Responsive layout so you can edit on any device (thank you [Foundation](http://foundation.zurb.com))
- Bookmarkable User/Group edit pages (i.e., bookmark a group and when the application opens to that bookmark, you will be routed to the permissions/users for that user/group)
- Breadcrumbs

##Setup
- Download this github repository
- Upload repository to a Document Library in your SharePoint site
- Edit config.js
  - SP-PermissionManagement/js/config.js
  - Change url attribute value to your SharePoint site
    ```javascript
    var app = app || {};
    
    app.confg = {
        **url**: 'Your url goes here',
        trycount: 3,
        isTesting: false,
        property_map: {
          user: {
            ows_name: 'name',
            ows_username: 'username',
            ows_email: 'email'
          }
        }
      }
    ```
- Open index.html and start managing permissions

##Usage
You can modify either a selected user's permissions or the users in a group.

The dual list boxes on either edit page allow you to add or remove permissions/users to the selected user/group.  Just remember to save after!

##Compatibility
- IE9+, Chrome, Firefox
- SharePoint 2007*-2013

*This application will work in SharePoint 2007 environments when opened in your browser only.  You cannot properly use this module in a content editor webpart or page viewer webpart due to the inheritance of quirks mode from the aforementioned SharePoint 2007 to any embeded iframes. :(

##Dependencies
- jQuery
- Foundation
- Backbone
- Underscore

##Roadmap
- [x] Add ability to manage a group's users
- [x] Add ability to manage a user's groups
- [ ] Add abiility to manage permissions at the list/library level
- [x] Optimizations
  - [x] Optimize list filtering 
    - Resolved search delay using memoization and built-in underscore utility functions. 
  - [x] Optimize list rendering 
    - Initial list rendering is cached and queries are cached after fully rendered.
    - When a user searches, if the query is cached, set the list html to cached value, else render list in asynchronous fashion.


