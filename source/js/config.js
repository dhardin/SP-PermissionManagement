var app = app || {};

app.config = {
	url: '',
	tryCount: 3,
	testing: false,
	property_map: {
		user: {
			ows_name: 'name',
	    	ows_username: 'username',
	    	ows_email: 'email'
    	}
	}
};