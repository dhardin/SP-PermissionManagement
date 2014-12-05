 var app = app || {};

 app.utility = (function(){
 	var processData;
 // Begin Utility Method /processData/
     processData= function(results) {
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
   		processData: processData
   }
});