var app_helper = {
  methods: {
      decodeSharePointFieldUri: function(fieldName){
        var decodedFieldName = decodeURIComponent(fieldName); //first initial decode from URI
         return decodedFieldName.replace(/%5F/g, '_');
      }
    }
  };
