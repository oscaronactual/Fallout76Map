falloutApp.factory('mapDataService', ['$http', '$timeout', 'settings',
   function($http, $timeout, settings){
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
                                           markersLookup[item.Id] = item;
                                       }
                                   }
                                   else{
                                       markersLookup[item.Id] = item;
                                       item.iconUrl= settings.markerUrl + markersLookup[item.MarkerId].IconUrl;
                                       item.iconSize = [38, 95];
                                       item.iconAnchor=  [15,15];
                                       item.popupAnchor= [-3, -76];
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
                                       item.visible= true;
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
                                   //TODO : Delete groups that are IsDeleted
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
                                           iconUrl: settings.markerUrl + markersLookup[testPoint.MarkerId].IconUrl,
                                           iconSize: [30,30],
                                           iconAnchor: [15,15],
                                           popupAnchor: [-3, -76]
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
                                           iconUrl: settings.markerUrl + markersLookup[item.MarkerId].IconUrl,
                                           iconSize: [30,30],
                                           iconAnchor: [15,15],
                                           popupAnchor: [-3, -76]
                                       };
                                       item.Marker = markersLookup[item.MarkerId];
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

       function addAccordionPropertiesToCategory(category){
           category.isOpen = false;
           category.isHovered = false;
           category.Groups = [];
       }
        return {
            initializePoints: function(callback){
                latestUpdate = new Date();
                $http.get(settings.apiUrl + settings.mapPointsEndpoint, {
                    responseType:"json"
                })
                    .then(function(response){
                        response.data.Categories.forEach(function(item, index, array){
                            if(!item.IsDeleted){
                                item.groups = [];
                                addAccordionPropertiesToCategory(item);
                                categoriesLookup[item.Id] = item;
                                categoryList.push(categoriesLookup[item.Id]);
                            }
                        });
                        response.data.Markers.forEach(function(item, index, array){
                            if(!item.IsDeleted) {
                                markersLookup[item.Id] = item;
                                markerList.push(item);
                                item.iconUrl = settings.markerUrl + item.IconUrl;
                                item.iconSize = [30, 30];
                                item.iconAnchor = [15,15];
                                item.popupAnchor = [-3, -76];
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
                                item.visible = true;
                                item.Points = [];
                                item.Marker = markersLookup[item.MarkerId];
                                groupsLookup[item.Id] = item;
                                groupList.push(item);
                                namedGroups[item.GroupName] = item;
                                pointsGrouped.push(item);
                                category.Groups.push(item);
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
                                item.draggable = false;
                                item.layer = groupsLookup[item.GroupId].GroupName;
                                item.icon = {
                                    iconUrl: settings.markerUrl + markersLookup[item.MarkerId].IconUrl,
                                    iconSize: [30,30],
                                    iconAnchor: [15,15],
                                    popupAnchor: [-3, -76]
                                };
                                item.Marker = markersLookup[item.MarkerId];
                            }
                        });
                        callback();
                    }).then(function(response){

                });
                poll();
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