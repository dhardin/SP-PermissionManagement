#SP-PermissionManagement

An intuitive way to alter user permissions in SharePoint.


##Screenshot
![Permission Management Screenshot](https://raw.githubusercontent.com/dhardin/sp-permissionmanagement/master/user%20permissions.gif)

##Features
- Edit SharePoint user permissions
- Edit SharePoint group users
- Edit SharePoint group info
- Export User Permissions
- Export Users in a Group
- Remove a User from SharePoint Site
  + Removes all permissions, including unique permissions
- Responsive layout so you can edit on any device (thank you [Foundation](http://foundation.zurb.com))

##Setup
- Upload SP-PermissionManagement repository to a Document Library in your SharePoint site
- Edit config.js
  - SP-PermissionManagement/js/config.js
  - Change url attribute value to your SharePoint site
    ```javascript
    var app = app || {};
    
    app.confg = {
        url: 'Your url goes here', //set this property to your SharePoint sites top level URL
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
- Zurb Foundation
- Backbone.js
- Underscore.js

##Roadmap
- [x] Add ability to manage a group's users
- [x] Add ability to manage a user's groups
- [ ] Add abiility to manage permissions at the list/library level
- [x] Highlight search results
- [x] Optimizations
  - [x] Optimize list filtering 
    - Resolved search delay using memoization and built-in underscore utility functions. 
  - [x] Optimize list rendering 
    - Instead of re-rendering the full collection on an add/remove, we find the correct DOM index and add/remove the element that corresponds to that index using jQuery.  Results in a whole lot of awesomeness.
    - When a user searches, if the query is cached, set the list html to cached value, else render list in asynchronous fashion.


