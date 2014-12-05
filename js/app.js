var app = app || {};

var user_data = [
	{
		name: 'Hardin, Dustin',
		username: 'dustin.hardin',
		email: 'dustin.hardin@example.com',
		permissions: ['Admin']
	},
	{
		name: 'Doe, John',
		username: 'john.doe',
		email: 'john.doe@example.com',
		permissions: ['Visitors']
	}, {
		name: 'Doe, Jane',
		username: 'jane.doe',
		email: 'jane.doe@example.com'
	}
		
];

var group_data = [
	{
		id: '1',
		name: 'Admin',
		users: ['dustin.hardin'],
		active: true
	},{
		id: '2',
		name: 'Visitors',
		users: ['john.doe', 'jane.doe'],
		active: true
	},
];

var isTesting = true;

if (isTesting){
	//initialize data
	app.UserCollection = new app.LibraryUser(user_data);
	app.GroupCollection = new app.LibraryGroup(group_data);
	group_data.forEach(function(model, index){
		model.active = false;
	});
	app.GroupSelectedCollection = new app.LibraryGroup(group_data);

	//set views
} else {
	
}