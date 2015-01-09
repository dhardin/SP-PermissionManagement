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
- Sexy color scheme :bowtie:

##Setup
- Download this github repository
- Upload repository to a Document Library in your SharePoint site
- Edit config.js
  - [name of folder]/js/config.js
  - Change url attribute value to your SharePoint site
    - e.g., https://yoursite.com
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

##TODO
- [ ] Code cleanup
- [ ] Optimizations
  - [ ] Optimize list filtering 
    - Some lag (few miliseconds) is noticed when filtering on lists of around 500+.  We could fix the 'lag' by using setTimeout but that would effectively make our searching take longer.  A list of 500+ should not experience that much lag.  Might be other sources involved.
  - [ ] Optimize list rendering 

