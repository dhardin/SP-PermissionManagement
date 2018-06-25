var app_data = {
  methods: {
    getSiteCollections: function(callback, errorCallback){
      return axios({
        url:   "/_api/search/query?querytext='contentclass=STS_Site'&rowlimit='200'&selectproperties='Title,Path'",
        method: "get",
        headers: {
          "accept": "application/json;odata=verbose",
          "content-type": "application/json;odata=verbose"
        }
      }).then(function(response) {
        var data = response.data.d.results;
        var numRows = response.PrimaryQueryResult.RelevantResults.RowCount;
        var siteCollections = [];
        var i;
        var row;
        for(i = 0; i < numRows; i++){
            row = data.PrimaryQueryResult.RelevantResults.Table.Rows.results[i];
            siteCollections.push({title: row.Cells.results[2], url: row.Cells.results[3]});
        }
        if (callback) {
          callback(siteCollections);
        }
      }).catch(function(error) {
        if (errorCallback) {
          errorCallback(error);
        }
      });
    },
    getUsers: function(group, callback, errorCallback){
      return axios({
        url: this.config.siteUrl + "/_api/web/lists/GetByTitle('"+this.config.listName+"')/?$select=Title,RootFolder/ServerRelativeUrl&$expand=RootFolder",
        method: "get",
        headers: {
          "accept": "application/json;odata=verbose",
          "content-type": "application/json;odata=verbose"
        }
      }).then(function(response) {
        var data = response.data.d;
        if (callback) {
          callback(data);
        }
      }).catch(function(error) {
        if (errorCallback) {
          errorCallback(error);
        }
      });
    },
    getData: function(callback, errorCallback){
      var filterMap = {};
      var filters = '';
      var key;
      var i;
      var url;
      var subfilter = '';
      var date = null;
      var nextDate = null;
      if(this.config.hasFilterDetection){
        if(this.state_map.filters.hasFilters){
          filterMap = this.state_map.filters.filterMap;
          for(key in filterMap){
            subfilter = '';
              if(!this.state_map.fields.displayMap.hasOwnProperty(key)){
                continue;
              }
            for(i = 0; i < filterMap[key].length; i++){
              if(this.state_map.fields.displayMap[key].TypeAsString == 'DateTime'){
                date = new Date(decodeURIComponent(filterMap[key][i]));
                nextDate = new Date(date);
                nextDate.setDate(nextDate.getDate() + 1);
              }
              if(this.state_map.fields.displayMap.hasOwnProperty(key)){
                subfilter += (subfilter.length > 0 ? ' or ' : '' ) +
                  (this.state_map.fields.displayMap[key].TypeAsString != 'DateTime'
                    ? "startswith("+this.state_map.fields.displayMap[key].StaticName+(this.state_map.fields.displayMap[key].hasOwnProperty('LookupField') ? "/" + this.state_map.fields.displayMap[key].LookupField : "")+",'"+filterMap[key][i]+"')"
                    : this.state_map.fields.displayMap[key].StaticName + " ge datetime'" +date.toISOString() + "' and " + this.state_map.fields.displayMap[key].StaticName + " le datetime'" +nextDate.toISOString() + "'"
                  );
                }
            }
            filters += (filters.length > 0 ? ' and ' : '') + '(' + subfilter + ')';
          }
        }
      }
      try {
      url = this.config.siteUrl + "/_api/web/lists/GetByTitle('" + this.config.listName  + "')/Items?$select=Title,EncodedAbsUrl,"+ this.state_map.fields.displayMap[this.config.fieldName].StaticName
      + (this.state_map.fields.displayMap[this.config.fieldName].hasOwnProperty('LookupField') ?  "/"+ this.state_map.fields.displayMap[this.config.fieldName].LookupField +"&$expand="+this.state_map.fields.displayMap[this.config.fieldName].StaticName : "")
      + (this.state_map.filters.hasFilters
        ? '&$filter=' + filters + (this.config.isDocumentLibrary ? (filters.length > 0 ? ' and ' : '') + 'FSObjType eq ' + this.config.fileObjectType : '')
        : (this.config.isDocumentLibrary ? '&$filter=(FSObjType eq ' + this.config.fileObjectType + ')' : '')) + '&$top=5000';
      } catch(error){
        if (errorCallback) {
          errorCallback(error);
          return;
        }
      }
        return axios({
          url: url,
          method: "get",
          headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose"
          }
        }).then(function(response) {
          var data = response.data.d.results;
          if (callback) {
            callback(data);
          }
        }).catch(function(error) {
          if (errorCallback) {
            errorCallback(error);
          }
        });

      },
      getListData: function(callback, errorCallback){
        return axios({
          url: this.config.siteUrl + "/_api/web/lists/GetByTitle('"+this.config.listName+"')/?$select=Title,RootFolder/ServerRelativeUrl&$expand=RootFolder",
          method: "get",
          headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose"
          }
        }).then(function(response) {
          var data = response.data.d;
          if (callback) {
            callback(data);
          }
        }).catch(function(error) {
          if (errorCallback) {
            errorCallback(error);
          }
        });
      },
      getConfigData: function(callback, errorCallback) {
        return axios({
          url: this.site + "/_api/web/lists/GetByTitle('MetricsConfig')/Items?$filter=(startswith(Title,'" + window.location.pathname + "'))",
          method: "get",
          headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose"
          }
        }).then(function(response) {
          var data = response.data.d.results;
          if (callback) {
            callback(data);
          }
        }).catch(function(error) {
          if (errorCallback) {
            errorCallback(error);
          }
        });
      },
      saveConfigData: function(digest, callback, errorCallback){
        var listName = this.listName;
        var site = this.site;
        var url = site + "/_api/web/lists/GetByTitle('"+listName +"')" + (this.config.ID > 0 ? '/items('+this.config.ID+')' :  '/Items');
        var type = this.getItemTypeForListName(listName);
        var data = {
          Title: window.location.pathname
        };
        var headers = {
          "accept": "application/json;odata=verbose",
          "X-RequestDigest": digest,
          "content-Type": "application/json;odata=verbose"
        };

        if(this.config.ID > 0){
          _.extend(headers, {
            "IF-MATCH": "*",
            "X-HTTP-Method": "MERGE"
          });
        }
        _.extend(data, this.config, { '__metadata': { 'type': type } });
        data.metrics = JSON.stringify(this.config.metrics);
        //we don't need to pass in the id of the config data
        delete data.ID;
        return axios({
          url: url,
          method: "post",
          headers: headers,
          data: data
        }).then(function(response) {
          var data = (response.data.hasOwnProperty('d') ? response.data.d : JSON.parse(response.config.data));
          if (callback) {
            callback(data);
          }
        }).catch(function(error) {
          if (errorCallback) {
            errorCallback(error);
          }
        });
      },
      getListFields: function(callback, errorCallback){
        return axios({
          url: this.config.siteUrl + "/_api/web/lists/GetByTitle('"+this.config.listName+"')/Fields?$filter=Hidden eq false and ReadOnlyField eq false",
          method: "get",
          headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose"
          }
        }).then(function(response) {
          var data = response.data.d.results;
          if (callback) {
            callback(data);
          }
        }).catch(function(error) {
          if (errorCallback) {
            errorCallback(error);
          }
        });
      },
      getDigest: function(callback, errorCallback){
        return axios({
          url: this.site +  "/_api/contextinfo",
          method: "post",
          headers: {
            "Accept": "application/json; odata=verbose"
          },
        }).then(function(response) {
          var digest = response.data.d.GetContextWebInformation.FormDigestValue;
          if(callback){
            callback(digest);
          }
        }).catch(function(error) {
          if (errorCallback) {
            errorCallback(error);
          }
        });
      },  // Get List Item Type metadata
      getItemTypeForListName: function (name) {
        return "SP.Data." + name.charAt(0).toUpperCase() + name.split(" ").join("").slice(1) + "ListItem";
      },
      parseQuery: function(queryString) {
        var query = {};
        var pairs = (queryString[0] === '#' ? queryString.substr(1) : queryString).split('&');
        for (var i = 0; i < pairs.length; i++) {
          var pair = pairs[i].split('=');
          query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
        }
        return query;
      },
      updateHash: function(settings){
        var key;
        var  hash = '';
        for(key in settings){
          hash += (hash.length > 0 ? '&' : '') + key + '=' + settings[key];
        }
        window.location.hash = hash;
      }
    }
  };
