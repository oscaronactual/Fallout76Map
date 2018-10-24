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
                   $http.get(settings.apiUrl + settings.mapPointsEndpoint, {
                       responseType:"json"
                   })
                       .then(function(response){
                           response.data.Categories.forEach(function(item, index, array){
                               if(categoriesLookup[item.Id]){
                                   var cat = categoriesLookup[item.Id];
                                   if(cat.ModifiedDate < item.ModifiedDate){
                                       categoriesLookup[item.Id] = item;
                                   }
                               }else{
                                   categoriesLookup[item.Id] = item;
                                   categoryList.push(item);
                               }
                           });
                           response.data.Markers.forEach(function(item, index, array){
                               if(markersLookup[item.Id]){
                                   var marker = markersLookup[item.Id];
                                   if(marker.ModifiedDate < item.ModifiedDate){
                                       markersLookup[item.Id] = item;
                                   }
                               }else{
                                   markersLookup[item.Id] = item;
                                   item.iconUrl='img/leaf-green.png';
                                   item.iconSize = [38, 95];
                                   item.iconAnchor= [22, 94];
                                   item.popupAnchor= [-3, -76];
                               }
                               //shadowUrl: 'img/leaf-shadow.png',
                               //shadowSize:   [50, 64], // size of the shadow
                               //shadowAnchor: [4, 62],  // the same for the shadow
                           });
                           response.data.Groups.forEach(function(item, index, array){
                               if(groupsLookup[item.Id]){
                                   var group = groupsLookup[item.Id];
                                   if(group.ModifiedDate < item.ModifiedDate){
                                       groupsLookup[item.Id] = item;
                                       namedGroups[item.GroupName] = item;
                                       var pointsGroup = pointsGrouped.find(function(element){
                                           return element.Id = item.Id;
                                       });
                                       if(pointsGroup){
                                           pointsGroup.GroupName = item.GroupName;
                                           pointsGroup.name= item.GroupName;
                                           pointsGroup.MarkerId = item.MarkerId;
                                           pointsGroup.Marker = markersLookup[item.MarkerId];
                                       }
                                   }
                               }else{
                                   item.name= item.GroupName;
                                   item.type= 'group';
                                   item.visible= true;
                                   item.Points = [];
                                   item.Marker = markersLookup[item.MarkerId];
                                   groupsLookup[item.Id] = item;
                                   namedGroups[item.GroupName] = item;
                                   pointsGrouped.push(item);
                               }
                           });
                           response.data.Points.forEach(function(item, index, array){
                               if(groupsLookup[item.GroupId]){
                                   var point = groupsLookup[item.GroupId];
                                   if(point.ModifiedDate < item.ModifiedDate){
                                       pointLookup[item.Id] = item;
                                       item.Marker = markersLookup[item.MarkerId];
                                       item.title = item.PointName;
                                       item.lat = item.LatCoord;
                                       item.lng = item.LongCoord;
                                       item.draggable = true;
                                       item.layer = groupsLookup[item.GroupId].GroupName;
                                       item.icon = {
                                           iconUrl: 'img/leaf-green.png',
                                           iconSize: [36,36],
                                           iconAnchor: [18,18],
                                           popupAnchor: [-3, -76]
                                       };
                                   }
                               }else{

                               }
                               pointLookup[item.Id] = item;
                               groupsLookup[item.GroupId].Points.push(pointLookup[item.Id]);
                               pointsUngrouped.push(pointLookup[item.Id]);
                               //item.title = item.PointName;
                               item.lat = item.LatCoord;
                               item.lng = item.LongCoord;
                               item.draggable = true;
                               item.layer = groupsLookup[item.GroupId].GroupName;
                               item.icon = {
                                   iconUrl: '/markers/' + markersLookup[item.MarkerId].IconUrl,
                                   iconSize: [36,36],
                                   iconAnchor: [18,18],
                                   popupAnchor: [-3, -76]
                               };
                               item.Marker = markersLookup[item.MarkerId];
                           });
                       }).then(function(response){

                   });
                   poll();
               }, 30000);
       }
        return {
            initializePoints: function(callback){
                $http.get(settings.apiUrl + settings.mapPointsEndpoint, {
                    responseType:"json"
                })
                    .then(function(response){
                        response.data.Categories.forEach(function(item, index, array){
                            item.groups = [];
                            categoriesLookup[item.Id] = item;
                            categoryList.push(categoriesLookup[item.Id]);
                        });
                        response.data.Markers.forEach(function(item, index, array){
                            markersLookup[item.Id] = item;
                            markerList.push(item);
                            item.iconUrl='/markers/' + item.IconUrl;
                            item.iconSize = [38, 95];
                            item.popupAnchor= [-3, -76];
                            //shadowUrl: 'img/leaf-shadow.png',
                            //shadowSize:   [50, 64], // size of the shadow
                            //shadowAnchor: [4, 62],  // the same for the shadow
                        });
                        response.data.Groups.forEach(function(item, index, array){
                            item.name= item.GroupName;
                            item.type= 'group';
                            item.visible= true;
                            item.Points = [];
                            item.Marker = markersLookup[item.MarkerId];
                            groupsLookup[item.Id] = item;
                            namedGroups[item.GroupName] = item;
                            pointsGrouped.push(item);
                        });
                        response.data.Points.forEach(function(item, index, array){
                            pointLookup[item.Id] = item;
                            groupsLookup[item.GroupId].Points.push(pointLookup[item.Id]);
                            pointsUngrouped.push(pointLookup[item.Id]);
                            //item.title = item.PointName;
                            item.lat = item.LatCoord;
                            item.lng = item.LongCoord;
                            item.draggable = true;
                            item.layer = groupsLookup[item.GroupId].GroupName;
                            item.icon = {
                                iconUrl: '/markers/' + markersLookup[item.MarkerId].IconUrl,
                                iconSize: [36,36],
                                iconAnchor: [18,18],
                                popupAnchor: [-3, -76]
                            };
                            item.Marker = markersLookup[item.MarkerId];
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
            namedGroups: namedGroups
       }

   }
]);