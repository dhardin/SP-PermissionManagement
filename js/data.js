//our data module allows us to take in an array of objects 
//which will each reference a list and view GUID.
//
//The module processes each object linearly and then
//returns the results which is stored in the object.
//
//When a result is returned, a callback function is called on the result
//and each callback is also stored in the calling object.  This allows for us to
//process the results asynchronously.
//

var spData = (function(){
	var stateMap = {
		dataArr: [],
		currentDataArrIndex: 0
	},
	getData, _getListItems, processData;

	getData = function(dataArr, index, callback){
		var url, guid, viewName, type, dataCallback;

		if(!dataArr instanceof Array){
			return;
		}
		if (index > dataArr.length){
			return;
		}

		url = dataArr[index].url;
		guid = dataArr[index].guid;
		viewName = dataArr[index].viewName;
		type = dataArr[index].type;
		dataCallback = dataArr[index].callback;

		stateMap.dataArr = dataArr;
		stateMap.currentDataArrIndex = index = index || 0;

		getListItems(url, guid, viewName, type, function () {
			if (dataCallback){
				dataCallback(results);
			}
			if(index == dataArr.length){
				if(callback){
					callback();
				}
			} else {
				getData(dataArr, ++index, callback);
			}
		})

	};

	 // Begin Utility Method /_getListItems/
    _getListItems = function (url, guid, viewName, type, callback) {
        var results = [], soapEnv, body;


        soapEnv =
            '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
                <soap:Body>\
                    <GetListItems xmlns="http://schemas.microsoft.com/sharepoint/soap/">\
                        <listName>'+guid+'</listName>\
                        <viewName>'+viewName+'</viewName>\
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
            tryCount: 3,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                printError(XMLHttpRequest, textStatus, errorThrown)
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                } else if (callback) {
                    callback(textStatus);
                }
            },
            complete: function (xData, status) {
                var responseProperty = (type == config_map.type_map.document_library ? 'responseText' : 'responseXML'),
                 results = $(xData[responseProperty]).find('z\\:row');

                if (callback) {
                    callback(results);
                }
            },
            contentType: "text/xml; charset=\"utf-8\""
        });
    };
// End Utility Method /_getListItems/


 // Begin Utility Method /processData/
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

        return data;
    };
   // End Utility Method /processData/

	return {
		getData: getData,
        processData: processData
	};
})();