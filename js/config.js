var app = app || {};

app.config = {
	url: 'https://members.lcmp.csd.disa.mil/sites/jltv/',
	tryCount: 3,
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