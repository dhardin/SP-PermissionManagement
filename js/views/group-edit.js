var app = app || {};

app.ChartEditView = Backbone.View.extend({
	tagName: 'div',
	className: 'chartContainer',
	template: _.template($('#chart-template').html()),

	events:{
		'click #saveBtn':'onSaveChartClick',
		'click #newBtn': 'onNewBtnClick',
		'click #fetchBtn': 'onFetchBtnClick',
		'change #chartType': 'onSelectChange',
		'keyup #list_guid': 'onInputFieldChange',
		'keyup #url': 'onInputFieldChange'
	},

	initialize: function(){
		this.tryCount = 0;
		this.retryLimit = 3;
	},

	render: function () {
		var type = this.model.get('chartType');
		this.$el.html(this.template((this.model ? this.model.toJSON() : {})));
		this.$menu = this.$('#menu');
		this.$fetchBtn = this.$('#fetchBtn');
		this.$saveBtn = this.$('#saveBtn');
		this.$settings = this.$('#settings');
		
		//initialize and bind events to the menu plugin
		this.$menu.menu();
 
		this.$select = this.$('#chartType');
		this.$list_guid = this.$('#list_guid');
		this.$url = this.$('#url');
		this.$select.val(type);
		this.changeSettings(type);
		this.populateColumnData();
		this.$url.trigger('keyup');
		return this;
	},


    getListItems: function(url, guid, type, callback) {
        var results = [], soapEnv, body,   that = this;

        soapEnv =
            '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
                <soap:Body>\
                    <GetListItems xmlns="http://schemas.microsoft.com/sharepoint/soap/">\
                        <listName>' + guid + '</listName>\
                    </GetListItems>\
                </soap:Body>\
            </soap:Envelope>';



        $.ajax({
            url: url + "/_vti_bin/lists.asmx",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/GetListItems');
            },
            type: "POST",
            dataType: "xml",
            data: soapEnv,
            tryCount: this.tryCount,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                that.printError(XMLHttpRequest, textStatus, errorThrown);
                that.tryCount++;
                if (that.tryCount <= that.retryLimit) {
                    //try again
                    $.ajax(that);
                    return;
                } else if (callback) {
                    callback(textStatus);
                }
            },
            complete: function (xData, status) {
                var responseProperty = (type == 'document library' ? 'responseXML' : 'responseText'),
                 results = $(xData[responseProperty]).find('z\\:row');

                if (callback) {
                    callback(results);
                }
            },
            contentType: 'text/xml; charset="utf-8"'
        });
    },

   updateListItems: function(url, soap_env, callback){
	   var results = [],
	   that = this;

        $.ajax({
            url: url + "/_vti_bin/lists.asmx",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems');
            },
            type: "POST",
            dataType: "xml",
            data: soap_env,
            tryCount: 3,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                that.printError(XMLHttpRequest, textStatus, errorThrown);
                that.tryCount++;
                if (that.tryCount <= that.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                } else if (callback) {
                    callback(textStatus);
                }
            },
            complete: function (xData, status) {
                 results = $(xData.responseText).find('z\\:row');

                if (callback) {
                    callback(results);
                }
            },
            contentType: 'text/xml; charset="utf-8"'
        });
	},

	populateColumnData: function(){
		var data = this.model.get('data'),
			that = this,
			chart_type = this.model.get('chart_type'),
			key,
			$options = $('<select></select>');

			//populate select with every column in data obj
			//we only need to use the first object properties as a 
			//reference for the rest
			for (key in data[1]){
				$options.append($('<option value="' + key + '">' + key + '</option>'));
			}

		//populate each of the select columns with the fetched data
		$( '#info-bar' ).find( '.data-column' ).each( function( i, el ) {
				 $( el ).append($options.find('option').clone())
				 		.val(that.model.get(el.id));
		});

		switch (chart_type){
			case 'dot':
				break;
			default: 

		}
	},

	changeSettings: function(type){
		if (!type || type.length == 0){
			this.$settings.html('');
		}
		type = type.replace(' ', '_');
		type = type.toLowerCase();
		this.$settings.html($('#' + type + '_template').html());
	},



    processData: function(results) {
    	var data = [{}],
    		attrObj = {},
    		i, j, attribute,
    		chart = this.model;


    	//repackage data into an array which each index
    	//is an object with key value pairs
    	for (i = 0; i < results.length; i++){
    		attrObj = {};
    		if(!results[i].attributes){
    			continue;
    		}
    		for (j = 0; j < results[i].attributes.length; j++){
    			attribute = results[i].attributes[j];
    			attrObj[attribute.name] = attribute.value;
			}
			data.push(attrObj);
    	}

    	chart.set('data', data);
    },

    printError: function(XMLHttpRequest, textStatus, errorThrown) {
		console.log(XMLHttpRequest + '\n' + textStatus + '\n' + errorThrown);
	},

	save: function(options){
		options = options || {};
		var formData = options.formData || {},
			callback = options.callback || false, chart,
			trigger = (typeof options.trigger !== 'undefined' ? options.trigger : true),
		data;

		if (Object.keys(formData).length === 0){
			$( '#info-bar' ).find( 'input, select' ).each( function( i, el ) {
					formData[ el.id ] = $( el ).val();
			});
		}

		chart = this.model;

		if (!app.LibraryCollection.get({cid: this.model.cid})){
			formData['rank'] = app.LibraryCollection.length + 1;
			chart.set(formData);
			app.LibraryCollection.add(chart);
		} else {
			chart.set(formData);
		}

		/*
		this.updateListItems(url, soap_env, function(){
			alert('Save Complete!');
		});
		*/
 
 		if(trigger){
			app_router.navigate('edit/' + this.model.cid, { trigger: true });
		}

		if(callback){
			callback();
		}
	},

	onSaveChartClick: function(e) {
		e.preventDefault();
		this.save();
	},

	onNewBtnClick: function (e) {
		app_router.navigate('edit', {trigger: true});
	},

	onFetchBtnClick: function (e){
		var that = this;

		if(this.$fetchBtn.hasClass('disabled')){
			return;
		}

		this.parseSPUrl(this.$url.val(), function(result){
			that.save({
				formData: {
					list_name: result.title,
					url: result.site + (result.type == 'lists' ? 'lists/' + result.title + '/' : result.title + '/forms/'),
					site: result.site,
					type: result.type
				},
				trigger: false
			});
		});
		

		//make a web service on an the provided list guid
		var list_name = this.model.get('list_name'),
			url = this.model.get('site'),
			type = this.model.get('type'),
			that = this;

		this.getListItems(url, list_name, type, function(results){
			that.processData.call(that, results);
		});
		

		
	},

	onSelectChange: function(e){
		var chartType = this.$select.val(),
		that = this;
		this.changeSettings(chartType);
		this.populateColumnData();
		this.save({
			formData: {
				dataColumn1: '',
				dataColumn2: '',
				nameColumn: ''
			},
			callback: function(){that.trigger('chart-change');}
		});
		
	},

	onInputFieldChange: function(e){
		var regexURL = /https?:\/\/.+/,
			guidVal = this.$list_guid.val(),
			urlVal = this.$url.val();


		if(regexURL.test(urlVal)){
			this.$fetchBtn.removeClass('disabled');
		} else{
			this.$fetchBtn.addClass('disabled');
		}
	},

	parseSPUrl: function(url, callback){
			if (!url){
				return;
			}

			var result = {site: 'N/A', title: 'N/A', type: 'N/A'},
				listPathIndex = url.toLowerCase().indexOf('lists'), 
				formsPathIndex = url.toLowerCase().indexOf('forms'), 
				titleStartIndex = -1, titleEndIndex = -1,
				tempUrl = '';

			


				//parse out the site from the url
			if(listPathIndex > -1){
				//parse out the title of the list or library from the url
				titleEndIndex = (url.lastIndexOf('/') < url.length - 1 ? url.lastIndexOf('/') : url.length);
				tempUrl = url.substr(0, titleEndIndex);
				titleStartIndex = tempUrl.lastIndexOf('/') + 1;

				result.title = tempUrl.substr(titleStartIndex, titleEndIndex);
				result.site = url.substr(0, listPathIndex);
				result.type = 'list';

			} else if (formsPathIndex > -1){
				//parse out the title of the list or library from the url
				titleEndIndex = formsPathIndex - 1;
				tempUrl = url.substr(0, titleEndIndex);
				titleStartIndex = tempUrl.lastIndexOf('/') + 1;

				result.title = tempUrl.substr(titleStartIndex, titleEndIndex);
				result.site = tempUrl.substr(0, titleStartIndex);
				result.type = 'document library';
			} 

			if(callback){
				callback(result);
			}
		}

});
