 var app = app || {};

 app.utility = (function(){
 	var processData;
 // Begin Utility Method /processData/
     processData= function(results) {
        var data = [],
            attrObj = {},
            i, j, attribute;


        //repackage data into an array which each index
        //is an object with key value pairs
        for (i = 0; i < results.length; i++){
            attrObj = {};
            if(!results[i].attributes){
                continue;
            }
            for (j = 0; j < results[i].attributes.length; j++){
                attribute = results[i].attributes[j];
                attrObj[attribute.name.toLowerCase()] = attribute.value.replace('\\', '/');
            }
          
            data.push(attrObj);
          
        }

        return data;
    };
   // End Utility Method /processData/
   
   // Begin Utility method /getDateTime/
   getDateTime = function () {
       //return date and time in mm-dd-yyyy @ hh:mm:ss format
       var date = new Date(),
        year = date.getFullYear(),
        month = ('0' + date.getMonth() + 1).slice(-2),
        day = ('0' + date.getDate()).slice(-2),
        hour = ('0' + date.getHours()).slice(-2),
        minutes = ('0' + date.getMinutes()).slice(-2),
        seconds = ('0' + date.getSeconds()).slice(-2);

       return month + '-' + day + '-' + year + ' @ ' + hour + ':' + minutes + ':' + seconds;
   };
   // End Utility method /getDateTime/
   
   // Begin Utility method /JSONtoCSVConverter/
   
 JSONToCSVConvertor = function (JSONData, ReportTitle, ShowLabel) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    
    var CSV = '';    
    //Set Report title in first row or line
    
    CSV += ReportTitle + '\r\n\n';

    //This condition will generate the Label/Header
    if (ShowLabel) {
        var row = "";
        
        //This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {
            
            //Now convert each value to string and comma-seprated
            row += index + ',';
        }

        row = row.slice(0, -1);
        
        //append Label row with line break
        CSV += row + '\r\n';
    }
    
    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
        var row = "";
        
        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in arrData[i]) {
            row += '"' + arrData[i][index] + '",';
        }

        row.slice(0, row.length - 1);
        
        //add a line break after each row
        CSV += row + '\r\n';
    }

    if (CSV == '') {        
        alert("Invalid data");
        return;
    }   
    
    //Generate a file name
    var fileName = "MyReport_";
    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName += ReportTitle.replace(/ /g,"_");   
    
    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
    
    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension    
    
    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");    
    link.href = uri;
    
    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";
    
    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
   // End Utility method
   
   // Begin Utility Method /printToNewWindow/
   printToNewWindow = function(stuffToPrint){
        var myWindow=window.open('','','fullscreen=no,scrollbars=yes');
        myWindow.document.write(stuffToPrint);
        myWindow.focus();
   };
   // End Utility Method /printToNewWindow/
   
   // Begin utility method /endsWith/
   
endsWith = function(string, suffix){
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
};
   // End utility method /endsWith/

   return {
   		processData: processData,
        getDateTime: getDateTime,
        JSONToCSVConvertor: JSONToCSVConvertor,
        endsWith: endsWith,
        printToNewWindow: printToNewWindow
   };
})();

