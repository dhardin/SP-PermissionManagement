var app = app || {};

app.testing = false;

app.state_map = {
	fetchingData : false,
	dataLoadCallback : false,
	filterOptions : false
}


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

app.testing = true;

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
	//fetch user data and once complete, set user list.
	app.data.getUsers(app.config.url, function(users){
		var key, i, temp_user, user, new_key, userArr = [];
		users = app.utility.processResults(users);
		for(i = 0; i < users.length; i++){
			temp_user = users[i];
			user = {};
			for (key in app.property_map.users){
				new_key = app.property_map.users[key];
				if (temp_user.hasOwnProperty(key)){
					user[new_key] = temp_user[key];
				}
			}
			//add user to user array
			userArr.push(user);
		}

		//initialize data
		app.UserCollection = new app.LibraryUser(user_data);
	});
	//fetch group data and once complete, set group listings
	app.data.getUsers(app.config.url, function(groups){
		var key, i, temp_group, group, new_key, groupArr = [];
		groups = app.utility.processResults(groups);
		for(i = 0; i < groups.length; i++){
			temp_user = groups[i];
			group = {};
			for (key in app.property_map.groups){
				new_key = app.property_map.groups[key];
				if (temp_user.hasOwnProperty(key)){
					group[new_key] = temp_user[key];
				}
			}
			//add group to group array
			groupArr.push(group);
		}

		app.GroupCollection = new app.LibraryGroup(groupArr);
		groupArr.forEach(function(model, index){
			model.active = false;
		});
		app.GroupSelectedCollection = new app.LibraryGroup(groupArr);
	});
}