var app = app || {};

app.PreviewView = Backbone.View.extend({
	events: {

	},

	initialize: function () {
		var that = this;
		//this.listenTo(app.LibraryCollection, 'change', this.render);
		this.on('chart-change', function(model){
			that.render(model);
		});
	},

	

	render: function (model) {
	
			 _.defer(_.bind(function() {  
			 	var width = this.$el.width(),
			 		height = this.$el.parent().height(),	
				data = model.get('data'),
				data_col1 = model.get('dataColumn1'),
				data_col2 = model.get('dataColumn2'),
				name_col = model.get('nameColumn'),
				chartType = model.get('chartType') || '',
				legend_arr = [], i,
				data_arr1 = this.extractDataArr(data, data_col1),
				data_arr2 = this.extractDataArr(data, data_col2),
				name_arr = this.extractDataArr(data, name_arr);


				

				this.graph = this.$el.children().length > 0 ? this.graph : Raphael(this.$el[0]);

				this.graph.clear();

				this.graph.setViewBox(0,0,width, height, true);

				this.graph.setSize('100%', '100%');
				

				switch(chartType){
					case 'pie':
						if (data_arr1.length == 0){
							data_arr1 = [1,3,9,16,25];
						}
						if (data_arr2.length == 0){
							data_arr2 = [100,50,25,12,6];
						}
						if (name_arr.length = 0){
							name_arr = [1,2,3,4,5];
						}
						// Creates pie chart at with center at 320, 200,
						// radius 100 and data: [55, 20, 13, 32, 5, 1, 2]
						var pie = this.graph.piechart(width/2, height/2, height*0.4, data_arr1,  { legend: legend_arr, legendpos: "east"});

						for (i = 0; i < data_arr1.length; i++){
							legend_arr.push("%%.%%");
						}

		                pie.hover(function () {
		                    this.sector.stop();
		                    this.sector.scale(1.1, 1.1, this.cx, this.cy);

		                    if (this.label) {
		                        this.label[0].stop();
		                        this.label[0].attr({ r: 7.5 });
		                        this.label[1].attr({ "font-weight": 800 });
		                    }
		                }, function () {
		                    this.sector.animate({ transform: 's1 1 ' + this.cx + ' ' + this.cy }, 500, "bounce");

		                    if (this.label) {
		                        this.label[0].animate({ r: 5 }, 500, "bounce");
		                        this.label[1].attr({ "font-weight": 400 });
		                    }
		                });
        
						break;
					case 'line':
						if (data_arr1.length == 0){
							data_arr1 = [1,3,9,16,25];
						}
						if (data_arr2.length == 0){
							data_arr2 = [100,50,25,12,6];
						}
						if (name_arr.length == 0){
							name_arr = [1,2,3,4,5];
						}
						this.graph.linechart(0, 0, width, height, name_arr, [data_arr1, data_arr2], {smooth: true, colors: ['#F00', '#0F0', '#00F'], symbol: 'circle'});
						break;
					case 'bar':
						if (data_arr1.length == 0){
							data_arr1 = [1,3,9,16,25];
						}
						if (data_arr2.length == 0){
							data_arr2 = [100,50,25,12,6];
						}
						if (name_arr.length = 0){
							name_arr = [1,2,3,4,5];
						}
						this.graph.barchart(0, 0, width, height, data_arr1, {})
						break;
					case 'horizontal bar':
						if (data_arr1.length == 0){
							data_arr1 = [1,3,9,16,25];
						}
						if (data_arr2.length == 0){
							data_arr2 = [100,50,25,12,6];
						}
						if (name_arr.length = 0){
							name_arr = [1,2,3,4,5];
						}
						this.graph.hbarchart(0, 0, width, height, data_arr1, {})
						break;
					case 'dot':
						var y_arr = [];
						if (data_arr1.length == 0){
							data_arr1 = [76, 70, 67, 71, 69];
						}
						if (data_arr2.length == 0){
							data_arr2 = [100, 120, 140, 160, 500];
						}
						if (name_arr.length == 0){
							name_arr = ['Mexico', 'Argentina', 'Cuba', 'Canada', 'United States of America'];
						}

						for (var i = 0; i < data_arr1.length; i++){
							y_arr.push(i);
						}
						//life, expectancy, country and spending per capita (fictional data)
						this.graph.dotchart(0, 0, width, height, data_arr1, y_arr, data_arr2, {max: 10, axisylabels: name_arr, heat: true, axis: '0 0 1 1'})
						break;
					default:
						this.graph.clear();
						break;
				}
					$(this.graph.canvas).find('text').attr('font', '100px Arial, sans-serif');

  			}, this));

		
		
		return this;
	},

	extractDataArr: function(arr, attr_name){
		var i = 0, data_arr = [];

		if(!arr instanceof Array) {
			return [];
		}

		for (i = 0; i < arr.length; i++){
			if (arr[i].hasOwnProperty(attr_name)){
				data_arr.push(arr[i][attr_name]);
			}
		}

		return data_arr;
	}



});
