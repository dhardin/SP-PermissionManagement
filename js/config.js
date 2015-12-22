var app = app || {};

app.config = {
	url: 'url to your SharePoint top level site goes here...',
	tryCount: 3,
	testing: false,
	property_map: {
		user: {
			ows_name: 'name',
	    	ows_username: 'username',
	    	ows_email: 'email'
    	}
	}//,
  //  groupOwner: {
  //      type: 'group or user',
  //        name: 'name of group/username here'
    }
};