var app = app || {};

app.DesignView = Backbone.View.extend({
	tagName: 'div',
	template: _.template($('#design-template').html()),

	events: {
		'keyup #search': 'onSearch'
	},
	initialize: function (options) {
		var that = this;

		this.libraryView =  new app.LibraryView();
		this.chart_id = (typeof this.libraryView.collection.get({cid: options.chart_id}) !== 'undefined' ? options.chart_id : false);
		
		if (!this.chart_id){
			app_router.navigate('edit/', { trigger: true });
		}
		

		this.on('renderComplete', this.onRenderComplete);
		this.libraryView.collection.on('change:chartType', function(model, type){
			that.previewView.trigger('chart-change', model);
		});

	},

	render: function () {
		this.$el.html(this.template());

		return this.trigger('renderComplete');
	},

	onRenderComplete: function () {
		var chart;

		this.$info_bar = this.$('#info-bar');
		this.$preview =this.$('#preview');
		this.$chart_collection = this.$('#chart_collection');
		this.$search = this.$('#search');
		this.$chart_section = this.$('#chart_section');

		chart =  (this.chart_id 
					?  this.libraryView.collection.get({cid: this.chart_id})
					: new app.Chart());

		this.chartView = new app.ChartEditView({
			model: chart
		});

		this.listenTo(this.chartView, 'chart-change', this.onChartChange);
		this.previewView = new app.PreviewView({model: chart});

		this.libraryView.setElement(this.$chart_collection);
		this.chartView.setElement(this.$info_bar);
		this.previewView.setElement(this.$preview);
		this.previewView.render(chart);
		this.libraryView.render();
		this.chartView.render();	

		//initiate jquery collapse plugin
		 this.$chart_section.accordion({
      		collapsible: true,
      		heightStyle: "content" 
    	 });
	},

	onSearch: function(e){
		this.libraryView.trigger('search', {val: this.$search.val()});
	}



});
