var app = app || {};

charts = [
	{
		title: 'Chart 1',
		list_guid: '',
		url: '',
		chartType: 'bar',
		rank: '1',
		data: [
			{team: 'A', miles: 103},
			{team: 'B', miles: 234},
			{team: 'C', miles: 451},
			{team: 'D', miles: 144},
			{team: 'E', miles: 74},
			{team: 'F', miles: 231},
			],
        dataColumn1: 'miles',
        dataColumn2: '',
        nameColumn: 'team',
	},
	{
		title: 'Chart 2',
		list_guid: '',
		url: '',
		chartType: 'dot',
		rank: '2'
	},
	{
		title: 'Chart 3',
		list_guid: '',
		url: '',
		chartType: 'pie',
		rank: '3'
	}
];

var isTesting = false;

if (isTesting){
	spData.getData(app.config.dataArr, 0, function(results){
		app.LibraryCollection = new app.Library(results);
	});
} else {
	app.LibraryCollection = new app.Library(charts);
}