/*
 * spdirectory.js
 * Root namespace module
*/

/*jslint          browser : true,     continue : true,
  devel   : true,  indent : 2,        maxerr   : 50,
  newcapp : true,   nomen : true,     plusplus : true,
  regexp  : true,  sloppy : true,         vars : false,
  white   : true
*/
/*global $, spdirectory */

var spdirectory = (function () {
    //----------------- BEGIN MODULE SCOPE VARIABLES ---------------
    var
        configMap = {
            main_html: '<div class="sp-dir-container"><div class="renderMessage"><h2>Generating Directory</h2><em>Please Wait....</em></div><ul class="sp-dir"><li data-jstree=\'{"icon":"images/home.png", "opened":true}\'><a href="#">Home</a><ul class="tree-top"></ul></li></ul></div>',
            settings_map : {
                url: true
            },
            tree_item_map : {
                pageParentList: String()
                    + '<ul class="parentPage">'
                        + '<li>'
                            + '<a>Pages</a>'
                            + '<ul class="pages"></ul>'
                        + '</li>'
                    + '</ul>',
                listParentList: String()
                  + '<ul class="parentList">'
                      + '<li>'
                          + '<a>Lists</a>'
                          + '<ul class="lists"></ul>'
                      + '</li>'
                  + '</ul>',
                child: '<li><a></a></li>'
            },
            data_tree_map : {//data-jstree=
                home: '{ "icon":"images/home.png" }',
                page: '{ "icon":"images/tree.png" }',
                list: '{ "icon":"images/list.png" }'
            }
        },
        settings_map = {
            url: "",
            jstree: false
        },
        stateMap = {
            $container: null,
            itemsLeft: 0
        },
        jqueryMap = {},
        
        initModule, setJqueryMap, getData, getWebs, getLists, printError, processResults, populateTree;

    //----------------- END MODULE SCOPE VARIABLES ---------------
    //----------------- BEGIN UTILITY METHODS --------------------
    // Begin Utility Method /getWebs/
    getWebs = function (url, $target, callback) {
        var results = [],
            
        // Create the SOAP request
         soapEnv =
            '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
                <soap:Body>\
                  <GetWebCollection xmlns="http://schemas.microsoft.com/sharepoint/soap/" />\
                </soap:Body>\
            </soap:Envelope>';

       
        $.ajax({
            url: url + "/_vti_bin/webs.asmx",
            type: "POST",
            dataType: "xml",
            data: soapEnv,
            error: printError,
            complete:  function(xData, status){
                $(xData.responseText).find("web").each(function () {
                    var $this = $(this)[0],
                    title, url;

                    title = $this.title;
                    url = $this.getAttribute('url');
                    results.push({ title: title, url: url, type: 'web' });
                });

                if (callback) {
                    callback(results, $target);
                }
            },
            contentType: "text/xml; charset=\"utf-8\""
        });
    };
    // End Utility Method /getWebs/

    // Begin Utility Method /getLists/
    getLists = function (url, $target, callback) {
        var results = [],

        // Create the SOAP request
         soapEnv =
            '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
                <soap:Body>\
                  <GetListCollection xmlns="http://schemas.microsoft.com/sharepoint/soap/" />\
                </soap:Body>\
            </soap:Envelope>';


        $.ajax({
            url: url + "/_vti_bin/lists.asmx",
            type: "POST",
            dataType: "xml",
            data: soapEnv,
            error: printError,
            complete: function (xData, status) {
                $(xData.responseText).find("list").each(function () {
                    var $this = $(this)[0],
                    title, url;

                    title = $this.title;
                    url = $this.getAttribute('DefaultViewUrl');
                    results.push({ title: title, url: url, type: 'list' });
                });

                if (callback) {
                    callback(results, $target);
                }
            },
            contentType: "text/xml; charset=\"utf-8\""
        });
    };
    // End Utility Method /getLists/

    // Begin Utility Method /printError/
    printError = function (XMLHttpRequest, textStatus, errorThrown) {
        console.log("There was an error: " + errorThrown + " " + textStatus);
        console.log(XMLHttpRequest.responseText);
    };
    // End Utility Method /printError/

    // Begin Utility Method /processResult/
    processResult = function (arr, $target, type) {
        var i;

        if (arr.length == 0 && $target.find('ul')) {
           // $target.parent().parent().remove();
          
            //check to see if there are any items still querying for data from server
            if (stateMap.itemsLeft == 0) {
                //all items have finished queries, genenerate jstree
                if (settings_map.jstree){
                    jqueryMap.$treeContainer.jstree();
                }
            }
        }

        for (i = 0; i < arr.length; i++) {
            var $listItem = $(configMap.tree_item_map.child),
                $pageChildList = $(configMap.tree_item_map.pageParentList),
                $listChildList = $(configMap.tree_item_map.listParentList);

           
           

            $listItem.find('a').text(arr[i].title);
            
            $listItem.find('a').attr('href', type == 'web' ? arr[i].url : settings_map.url + arr[i].url);
           
            $listItem.attr('data-jstree', arr[i].type == 'web' ? configMap.data_tree_map.page : configMap.data_tree_map.list);
            $listItem.appendTo($target);
            

           

            if (type == 'web') {
                
                $pageChildList.appendTo($listItem);
                $listChildList.appendTo($listItem);
                stateMap.itemsLeft++;

                getLists(arr[i].url, $listChildList.find('.lists'), function (results, $targetList) {
                    processResult(results, $targetList, 'list');
                });

                getWebs(arr[i].url, $pageChildList.find('.pages'), function (results, $targetList) {
                    stateMap.itemsLeft--;
                    processResult(results, $targetList, 'web');
               
                });
            }
        }
    };
    // End Utility Method /processResult/

    //----------------- END UTILITY METHODS ----------------------
    //--------------------- BEGIN DOM METHODS --------------------
    // Begin DOM method /setJqueryMap/
    setJqueryMap = function () {
        var
        $container = stateMap.$container;
        
        jqueryMap = {
            $container: $container,
            $treeContainer: $container.find('.sp-dir-container'),
            $tree: $container.find('.sp-dir'),
            $treeTop: $container.find('.tree-top'),
            $renderMsg: $container.find('.renderMessage')
        };
    };
    // End DOM method /setJqueryMap/

    //--------------------- END DOM METHODS --------------------

    initModule = function ($container, options) {
        var $tree = $(configMap.main_html);

        settings_map.url = options.url || "";
        settings_map.jstree = options.jstree || false;

        if (settings_map.url.length == 0) {
            return;
        }

        $tree.appendTo($container);
        stateMap.$container = $container;

        setJqueryMap();
      
        getWebs(settings_map.url, jqueryMap.$treeTop, function (results, $target) {
            processResult(results, $target, 'web');
        });

        if(settings_map.jstree){
            jqueryMap.$treeContainer
               .on('changed.jstree', function (e, data) {
                   //get url for item clicked and open it in new window if
                   //it has a valid url
                   var i, j, r = [], href, text;
                   for (i = 0, j = data.selected.length; i < j; i++) {
                       href = data.instance.get_node(data.selected[i])['a_attr'].href;
                   }
                   if (href != '#') {
                       window.open(href);
                   }
               })
               .on('loaded.jstree', function (e, data) {
               
               });
        }
    };
    return { initModule: initModule };
}());