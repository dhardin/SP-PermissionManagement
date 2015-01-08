var app = app || {};

app.config = {
	url: 'url to your SharePoint top level site goes here...',
	tryCount: 3,
	isTesting: false,
	property_map: {
		user: {
			ows_name: 'name',
	    	ows_username: 'username',
	    	ows_email: 'email'
    	},
    	group: {
    		
    	}
	}
};