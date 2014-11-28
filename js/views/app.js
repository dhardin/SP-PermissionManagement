var app = app || {};


app.AppView = {
	showView : function(view){
		if (this.currentView){
			this.currentView.close();
		}

		this.currentView = view;
		this.currentView.render();

	 $('#main').html(this.currentView.el);
	}
};
Backbone.pubSub = _.extend({}, Backbone.Events);
Backbone.View.prototype.close = function(){
	this.remove();
	this.unbind();
	if(this.onClose){
		this.onClose();
	}
}