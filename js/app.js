var app = app || {};

app.testing = false;

app.state_map = {
	fetchingUsers: false,
	fetchingGroups: false,
	fetchingData : false,
	dataLoadCallback : false,
	filterOptions : false
}


var user_data = [
	{
		name: 'Hardin, Dustin',
		loginname: 'dustin.hardin',
		email: 'dustin.hardin@example.com',
		permissions: ['Admin']
	},
	{
		name: 'Doe, John',
		loginname: 'john.doe',
		email: 'john.doe@example.com',
		permissions: ['Visitors']
	}, {
		name: 'Doe, Jane',
		loginname: 'jane.doe',
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

app.DataFetched = function(){
	console.log('data fetched!');
	if(!app.state_map.fetchingUsers && !app.state_map.fetchingGroups){
		app.state_map.fetchingData = false;
		if(app.state_map.dataLoadCallback){
			app.state_map.dataLoadCallback();
		}
	}
}



if (app.testing){
	//initialize data
	app.UserCollection = new app.LibraryUser(user_data);
	app.GroupCollection = new app.LibraryGroup(group_data);
	group_data.forEach(function(model, index){
		model.active = false;
	});
	app.GroupSelectedCollection = new app.LibraryGroup(group_data);

	
} else {
	app.state_map.fetchingData = true;
	app.state_map.fetchingUsers = true;
	app.state_map.fetchingGroups = true;
	//fetch user data and once complete, set user list.
	app.data.getUsers(app.config.url, function(users){
		var key, i, temp_user, user, new_key, userArr = [];
		users = app.utility.processData(users);

		//initialize data
		app.UserCollection = new app.LibraryUser(users);
		app.state_map.fetchingUsers = false;
		app.DataFetched();
	});
	//fetch group data and once complete, set group listings
	app.data.getPermissions(app.config.url,'', function(groups){
		var key, i, temp_group, group, new_key, groupArr = [];
		groups = app.utility.processData(groups);
		
		app.GroupCollection = new app.LibraryGroup(groups);
		groups.forEach(function(model, index){
			model.active = false;
		});
		app.GroupSelectedCollection = new app.LibraryGroup(groups);
		app.state_map.fetchingGroups = false;
		app.DataFetched();
	});
}

