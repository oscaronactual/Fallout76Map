falloutApp.factory('mapDataService', ['$http',
   function($http){
        var pointsGrouped = [];
        var pointsUngrouped = [];
        var pointLookup = {};
        var groupsLookup = {};
        var markersLookup = {};
        var namedGroups={};
        var latestUpdate;

        return {
            initializePoints: function(callback){
                $http.get('https://falloutmaps.azurewebsites.net/api/falloutpoints', {
                    responseType:"json"
                })
                    .then(function(response){
                        if(response.data.Categories){
                            response.data.Categories.forEach(function(item, index, array){

                            });
                        }
                        response.data.Groups.forEach(function(item, index, array){
                            groupsLookup[item.Id.replace(/-/g,'')] = item;
                            namedGroups[item.GroupName] = item;
                                item.name= item.GroupName;
                                item.type= 'group';
                                item.visible= true;
                            pointsGrouped.push(item);
                            item.Points = [];
                        });
                        response.data.Markers.forEach(function(item, index, array){
                            markersLookup[item.Id] = item;
                            item.iconUrl='img/leaf-green.png';
                            item.iconSize = [38, 95];
                            item.iconAnchor= [22, 94];
                            item.popupAnchor= [-3, -76];
                            //shadowUrl: 'img/leaf-shadow.png',
                            //shadowSize:   [50, 64], // size of the shadow
                            //shadowAnchor: [4, 62],  // the same for the shadow
                        });
                        response.data.Points.forEach(function(item, index, array){
                            groupsLookup[item.GroupId.replace(/-/g,'')].Points.push(item);
                            pointLookup[item.Id.replace(/-/g,'')] = item;
                            pointsUngrouped.push(item);
                            item.title = item.PointName;
                            item.lat = item.LatCoord;
                            item.lng = item.LongCoord;
                            item.layer = groupsLookup[item.GroupId.replace(/-/g,'')].GroupName;
                            item.icon = {
                                iconUrl: 'img/leaf-green.png',
                                iconSize: [38, 95],
                                iconAnchor: [22, 94],
                                popupAnchor: [-3, -76]
                            };
                            item.Marker = markersLookup[item.MarkerId];
                        });
                        callback();
                    }).then(function(response){

                });
            },
            groupedPoints: pointsGrouped,
            points: pointsUngrouped,
            pointsLookup : pointLookup,
            groupsLookup: groupsLookup,
            namedGroups: namedGroups
       }

   }
]);