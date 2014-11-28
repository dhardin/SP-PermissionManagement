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
		name: 'Admin',
		users: ['dustin.hardin'],
		selected: true
	},{
		name: 'Visitors',
		users: ['john.doe']
	},{
		name: 'Admin',
		users: ['dustin.hardin']
	},{
		name: 'Visitors',
		users: ['john.doe']
	},{
		name: 'Admin',
		users: ['dustin.hardin']
	},{
		name: 'Visitors',
		users: ['john.doe']
	},{
		name: 'Admin',
		users: ['dustin.hardin']
	},{
		name: 'Visitors',
		users: ['john.doe']
	},{
		name: 'Admin',
		users: ['dustin.hardin']
	},{
		name: 'Visitors',
		users: ['john.doe']
	},{
		name: 'Admin',
		users: ['dustin.hardin']
	},{
		name: 'Visitors',
		users: ['john.doe']
	},{
		name: 'Admin',
		users: ['dustin.hardin']
	},{
		name: 'Visitors',
		users: ['john.doe']
	},{
		name: 'Admin',
		users: ['dustin.hardin']
	},{
		name: 'Visitors',
		users: ['john.doe']
	},{
		name: 'Admin',
		users: ['dustin.hardin']
	},{
		name: 'Visitors',
		users: ['john.doe']
	},{
		name: 'Admin',
		users: ['dustin.hardin']
	},{
		name: 'Visitors',
		users: ['john.doe']
	}
]

var isTesting = true;

if (isTesting){
	//initialize data
	app.UserCollection = new app.LibraryUser(user_data);
	app.GroupCollection = new app.LibraryGroup(group_data);
	app.GroupSelectedCollection = new app.LibraryGroup([]);

	//set views
} else {
	
}