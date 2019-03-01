falloutApp.factory('mapDataService', ['$http', '$timeout', 'settings', '$rootScope','localStorageService',
   function($http, $timeout, settings, $rootScope, localStorageService){
       var pointsGrouped = [];
       var pointsUngrouped = [];
       var categoriesLookup = {};
       var groupsLookup = {};
       var markersLookup = {};
       var pointLookup = {};
       var categoryList = [];
       var groupList = [];
       var markerList = [];
       var pointList = [];
       var namedGroups={};
       var latestUpdate;
       var scope = $rootScope;

       function poll(){
           $timeout(
               function(){
                   var newLatestUpdate = new Date();
                   var payload = {
                       LatestUpdateTime: latestUpdate
                   };
                   $http.get(settings.apiUrl + settings.updateEndpoint)// + latestUpdate.valueOf())
                       .then(function(response){
                           response.data.Categories.forEach(function(item, index, array){
                               if(!item.IsDeleted){
                                   if(categoriesLookup[item.Id]){
                                       var cat = categoriesLookup[item.Id];
                                       cat.CategoryName = item.CategoryName;
                                   }else{
                                       addAccordionPropertiesToCategory(item);
                                       categoriesLookup[item.Id] = item;
                                       categoryList.push(item);
                                       item.isDeselected = false;
                                   }

                               }else{
                                   if(categoriesLookup[item.Id]){
                                       delete categoriesLookup[item.Id];
                                       var deleteCategoryIndex = categoryList.findIndex(function(element){
                                           return element.Id === item.Id;
                                       });
                                       categoryList.splice(deleteCategoryIndex,1);
                                   }
                               }
                           });
                           response.data.Markers.forEach(function(item, index, array){
                               if(!item.IsDeleted){
                                   if(markersLookup[item.Id]){
                                       var marker = markersLookup[item.Id];
                                       if(marker.ModifiedDate < item.ModifiedDate){
                                           item.iconUrl= settings.markerUrl + markersLookup[item.MarkerId].IconUrl;
                                           item.iconSize= [25,25];
                                           item.iconAnchor = [15,15];
                                           item.popupAnchor = [0, -10];
                                           markersLookup[item.Id] = item;
                                       }
                                   }
                                   else{
                                       markersLookup[item.Id] = item;
                                       item.iconUrl= settings.markerUrl + markersLookup[item.MarkerId].IconUrl;
                                       item.iconSize= [25,25];
                                       item.iconAnchor = [15,15];
                                       item.popupAnchor = [0, -10];
                                   }
                               }else{
                                   if(markersLookup[item.Id]){
                                       delete markersLookup[item.Id];
                                       var deleteMarkerIndex = markerList.findIndex(function(element){
                                           return element.Id === item.Id;
                                       });
                                       markerList.splice(deleteMarkerIndex, 1);
                                   }
                               }

                               //shadowUrl: 'img/leaf-shadow.png',
                               //shadowSize:   [50, 64], // size of the shadow
                               //shadowAnchor: [4, 62],  // the same for the shadow
                           });
                           response.data.Groups.forEach(function(item, index, array){
                               if(!item.IsDeleted){
                                   if(groupsLookup[item.Id]){
                                       var presentGroup = groupsLookup[item.Id];
                                       presentGroup.GroupName = item.GroupName;
                                       presentGroup.name= item.GroupName;
                                       presentGroup.visible = item.VisibleByDefault;
                                       presentGroup.MarkerId = item.MarkerId;
                                       presentGroup.Marker = markersLookup[item.MarkerId];

                                       if(categoriesLookup[presentGroup.CategoryId].Id !== item.CategoryId){
                                           var oldCategory = categoriesLookup[presentGroup.CategoryId];
                                           var oldCatGroupIndex = oldCategory.Groups.findIndex(function(element){
                                               return element.Id === item.Id;
                                           });
                                           oldCategory.Groups.splice(oldCatGroupIndex, 1);
                                           var newCategory = categoriesLookup[item.CategoryId];
                                           newCategory.Groups.push(presentGroup);
                                       }
                                   }
                                   else{
                                       item.name= item.GroupName;
                                       item.type= 'group';
                                       item.visible = item.VisibleByDefault;
                                       item.Points = [];
                                       item.Marker = markersLookup[item.MarkerId];
                                       groupsLookup[item.Id] = item;
                                       groupList.push(item);
                                       namedGroups[item.GroupName] = item;
                                       pointsGrouped.push(item);
                                       categoriesLookup[item.CategoryId].Groups.push(item);
                                   }
                               }
                               else{
                                   categoryList.forEach(function(element){
                                       findAndSplice(item.Id, element.Groups);
                                   });
                                   findAndSplice(item.Id, groupList);
                                   delete groupsLookup[item.Id];
                               }
                           });
                           response.data.Points.forEach(function(item, index, array){
                               if(!item.IsDeleted){
                                   var testPoint = pointLookup[item.Id];
                                   if(testPoint){//is the point already here
                                       if(testPoint.GroupId !== item.GroupId){
                                           var newGroup = groupsLookup[item.GroupId];
                                           testPoint.layer = newGroup.GroupName;
                                       }

                                       if(testPoint.MarkerId !== item.MarkerId){
                                           testPoint.Marker = markersLookup[item.MarkerId];
                                       }
                                       testPoint.lat = item.LatCoord;
                                       testPoint.lng = item.LongCoord;
                                       testPoint.draggable = false;
                                       testPoint.icon = {
                                           //iconUrl: settings.markerUrl + markersLookup[item.MarkerId].IconUrl,
                                           html:'<i class="icon-' + markersLookup[item.MarkerId].IconUrl.replace(".png","") + '" style="color: blue"></i>',
                                           type:'div',
                                           iconSize: [25,25],
                                           iconAnchor: [12,12],
                                           popupAnchor: [0, -10],
                                           className: 'fontMarker'
                                       };

                                   }
                                   else{ //its a new point!
                                       pointLookup[item.Id] = item;
                                       //groupsLookup[item.GroupId].Points.push(pointLookup[item.Id]);
                                       pointsUngrouped.push(pointLookup[item.Id]);
                                       //item.title = item.PointName;
                                       item.lat = item.LatCoord;
                                       item.lng = item.LongCoord;
                                       item.draggable = false;
                                       item.layer = groupsLookup[item.GroupId].GroupName;
                                       item.icon = {
                                           //iconUrl: settings.markerUrl + markersLookup[item.MarkerId].IconUrl,
                                           html:'<i class="icon-' + markersLookup[item.MarkerId].IconUrl.replace(".png","") + '" style="color: blue"></i>',
                                           type:'div',
                                           iconSize: [25,25],
                                           iconAnchor: [12,12],
                                           popupAnchor: [0, -10],
                                           className: 'fontMarker'
                                       };
                                       item.Marker = markersLookup[item.MarkerId];
                                       item.getMessageScope = function(){
                                           var newScope = scope.$new(true, $rootScope);
                                           angular.extend(newScope,{
                                               point: item
                                           });
                                           return newScope;
                                       };
                                       item.message = getMessageTemplate();
                                       item.popupOptions = {
                                           minWidth:200,
                                           className: "falloutMarkerPopup"
                                       };
                                       item.compileMessage = true;
                                   }
                               }
                               else{
                                   var deletePoint = pointLookup[item.Id];
                                   delete pointLookup[item.Id];
                                   deletePoint.layer = '';
                                   var deletePointIndex = pointsUngrouped.find(function(element){
                                       return element.Id === item.Id;
                                   });
                                   pointsUngrouped.splice(deletePointIndex,1);
                               }
                           });
                       }).then(function(response){

                   });
                   latestUpdate = newLatestUpdate;
                   poll();
               }, 30000);
       }
        function getMessageTemplate(){
            return  "    <div class='markerPopup' ng-controller='mapPointController'>\n" +
                    "      <div class='markerPopupHeader'>\n" +
                    "        <span class='markerTitle'>{{point.PointName}}</span>\n" +
                    "      </div>\n" +
                    "      <div class='markerData'>\n" +
                    "        <span class='markerDescription'>{{point.Description}}</span><br />\n" +
                    "        <a class='markerWikiLink' ng-show='point.Link' rel='noopener noreferrer' target='_blank' ng-href=\"{{point.Link}}\">Wiki:{{point.PointName}}</a><br />\n" +
                    "        <a class='markerFoundLink' href='#' ng-click='toggleFound()' \">Mark as found</a>\n" +
                    "        <a class='markerDirectLink' href='#' ngclipboard data-clipboard-text='https://www.falloutmaps.com/#!/{{point.Id}}'><span class='fas fa-link'></span></a>\n" +
                    "    </div>";
        }

       function addAccordionPropertiesToCategory(category){
           category.isOpen = false;
           category.isHovered = false;
           category.Groups = [];
       }

       var isInitialized = false;

        return {
            initializePoints: function(callback){
                if(isInitialized){
                    callback();
                    return;
                }
                var pointsFound = localStorageService.get('pointsFound');
                var groupsSelected = localStorageService.get('groupsSelected');
                if(! pointsFound){
                    localStorageService.set('pointsFound', []);
                    pointsFound = localStorageService.get('pointsFound');
                }
                else{

                }

                latestUpdate = new Date();
                $http.get(settings.apiUrl + settings.mapPointsEndpoint, {
                    responseType:"json"
                })
                    .then(function(response){
                        var foundPoints = localStorageService.get('pointsFound');

                        response.data.Categories.forEach(function(item, index, array){
                            if(!item.IsDeleted){
                                item.groups = [];
                                addAccordionPropertiesToCategory(item);
                                categoriesLookup[item.Id] = item;
                                categoryList.push(categoriesLookup[item.Id]);
                                item.isDeselected = false;
                            }
                        });
                        response.data.Markers.forEach(function(item, index, array){
                            if(!item.IsDeleted) {
                                markersLookup[item.Id] = item;
                                markerList.push(item);
                                item.iconUrl = settings.markerUrl + item.IconUrl;
                                item.iconSize= [25,25];
                                item.iconAnchor = [15,15];
                                item.popupAnchor = [0, -10];
                                //shadowUrl: 'img/leaf-shadow.png',
                                //shadowSize:   [50, 64], // size of the shadow
                                //shadowAnchor: [4, 62],  // the same for the shadow
                            }
                        });
                        response.data.Groups.forEach(function(item, index, array){
                            if(!item.IsDeleted) {
                                var category = categoriesLookup[item.CategoryId];
                                item.name = item.GroupName;
                                item.type = 'group';
                                item.visible = item.VisibleByDefault;
                                item.Points = [];
                                item.Marker = markersLookup[item.MarkerId];
                                groupsLookup[item.Id] = item;
                                groupList.push(item);
                                namedGroups[item.GroupName] = item;
                                pointsGrouped.push(item);
                                category.Groups.push(item);
                                category.isDeselected = !category.Groups.some(function(element){
                                    return element.visible;
                                })
                            }
                        });
                        response.data.Points.forEach(function(item, index, array){
                            if(!item.IsDeleted){
                                pointLookup[item.Id] = item;
                                groupsLookup[item.GroupId].Points.push(pointLookup[item.Id]);
                                pointsUngrouped.push(pointLookup[item.Id]);
                                //item.title = item.PointName;
                                item.lat = item.LatCoord;
                                item.lng = item.LongCoord;
                                item.getMessageScope = function(){
                                    var newScope = scope.$new(true, $rootScope);
                                    angular.extend(newScope,{
                                       point: item
                                    });
                                  return newScope;
                                };
                                item.message = getMessageTemplate();
                                item.popupOptions = {
                                    minWidth:200,
                                    className: "falloutMarkerPopup",
                                    permanent: item.AlwaysShowTooltip
                                };
                                item.compileMessage = true;
                                item.draggable = false;
                                item.layer = groupsLookup[item.GroupId].GroupName;
                                item.icon = {
                                    //iconUrl: settings.markerUrl + markersLookup[item.MarkerId].IconUrl,
                                    html:'<i class="icon-' + markersLookup[item.MarkerId].IconUrl.replace(".png","") + '"></i>',
                                    type:'div',
                                    iconSize: [25,25],
                                    iconAnchor: [12,12],
                                    popupAnchor: [0, -10],
                                    className: 'fontMarker'
                                };
                                item.Marker = markersLookup[item.MarkerId];
                                if (pointsFound.includes(item.Id)){
                                    item.isFound = true;
                                    item.opacity = 0.5;
                                }
                            }
                        });

                        if (!groupsSelected) {
                            groupsSelected = [];
                            groupList.forEach(function(element){
                                if (element.visible){
                                    groupsSelected.push(element.Id);
                                }
                            });
                            localStorageService.set('groupsSelected', groupsSelected)
                        }else{

                            groupList.forEach(function(element){
                                if (groupsSelected.includes(element.Id)){
                                    element.visible = true;
                                }else{
                                    element.visible = false;
                                }
                            });
                        }

                        callback();
                    }).then(function(response){

                });
                isInitialized = true;

                //poll();
            },
            groupedPoints: pointsGrouped,
            points: pointsUngrouped,
            pointsLookup : pointLookup,
            groupsLookup: groupsLookup,
            namedGroups: namedGroups,
            categories: categoryList
       }

   }
]);