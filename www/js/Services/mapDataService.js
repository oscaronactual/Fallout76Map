falloutApp.factory('mapDataService', ['$http','$timeout',"settings",
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

       function addPoint(point, callback){
            var payload = {
                PointName: point.pointName,
                LatCoord: point.lat,
                LongCoord: point.lng,
                Link: point.link,
                GroupId: point.groupId,
                MarkerId: point.markerId,
                Description: point.description
           };

               $http.post(settings.apiUrl + settings.mapPointsEndpoint, payload)
               .then(function(response){
                   var newPoint = response.data;
                   newPoint.title = newPoint.PointName;
                   newPoint.lat = newPoint.LatCoord;
                   newPoint.lng = newPoint.LongCoord;
                   newPoint.draggable = true;
                   newPoint.layer = groupsLookup[newPoint.GroupId].GroupName;
                   newPoint.icon = {
                       iconUrl: '/markers/' + markersLookup[newPoint.MarkerId].IconUrl,
                       iconSize: [36,36],
                       iconAnchor: [18,18],
                       popupAnchor: [-3, -76]
                   };
                   pointLookup[newPoint.Id] = newPoint;
                   groupsLookup[newPoint.GroupId].Points.push(pointLookup[newPoint.Id]);
                   pointsUngrouped.push(pointLookup[newPoint.Id]);

                   callback();
               })
               .then(function(response){

               });

       }
       function deletePoint(point, callback){
           $http.delete(settings.apiUrl + settings.mapPointsEndpoint + point.Id)
               .then(function(response){
                   delete pointLookup[point.Id];
                   callback();
               })
               .then(function(response){});
       }
       function updatePoint(point){
           var payload = {
               Id: point.pointId,
               PointName: point.pointName,
               LatCoord: point.lat,
               LongCoord: point.lng,
               Link: point.link,
               Description: point.description,
               GroupId: point.GroupId,
               MarkerId: point.MarkerId
           };
           $http.put(settings.apiUrl + settings.mapPointsEndpoint + point.pointId, payload)
               .then(function(response){
                   if(response.data === ""){ //api returns empty set when successful
                       var lookupPoint = pointLookup[point.pointId];
                       var groupPoint = groupsLookup[point.GroupId].Points.find(function(element){
                           return element.Id === point.pointId;
                       });
                       var ungroupPoint = pointsUngrouped.find(function(element){
                           return element.Id === point.pointId;
                       });
                       copyPointVals(lookupPoint, point);
                       copyPointVals(groupPoint, point);
                       copyPointVals(ungroupPoint, point);
                   }
               })
               .then(function(response){});
       }

       function copyPointVals(oldPoint, newPoint){
           oldPoint.PointName = newPoint.PointName;
           oldPoint.LatCoord = newPoint.lat;
           oldPoint.LongCoord = newPoint.lng;
           oldPoint.Link = newPoint.link;
           oldPoint.Description = newPoint.description;
           oldPoint.GroupId = newPoint.GroupId;
           oldPoint.MarkerId = newPoint.MarkerId;
           oldPoint.title = newPoint.PointName;
           oldPoint.lat = newPoint.lat;
           oldPoint.lng = newPoint.lng;
           oldPoint.layer = groupsLookup[newPoint.GroupId].GroupName;
           oldPoint.icon = {
               iconUrl: 'markers/' + markersLookup[newPoint.MarkerId].IconUrl,
               iconSize: [36,36],
               iconAnchor: [18,18],
               popupAnchor: [-3, -76]
           }
       }

       function addCategory(categoryname){
           var payload = {
               CategoryName: categoryname
           };
           $http.post(settings.apiUrl + settings.categoriesEndpoint, payload)
                .then(function(response){
                    if(response.data){
                        var item = response.data;
                        item.groups = [];
                        categoriesLookup[item.Id] = item;
                        categoryList.push(item);

                    }
                }).then(function(response){

            });
       }
       function deleteCategory(category){
           $http.delete(settings.apiUrl + settings.categoriesEndpoint + category.Id)
               .then(function(response){
                   if(response.data){
                       delete categoriesLookup[category.CategoryName];
                   }
               }).then(function(response){

           });
       }
       function updateCategory(category){
           var payload = {
               Id: category.Id,
               CategoryName: category.CategoryName
           };
           $http.put(settings.apiUrl + settings.categoriesEndpoint + category.Id, category)
               .then(function(response){
                   if(response.data){
                        var originalCat = categoriesLookup[response.data.Id];
                        originalCat.CategoryName = response.data.CategoryName;

                        var listedCat = categoryList.find(function(element){
                            return element.Id === response.data.Id;
                        });
                        if(listedCat){
                            listedCat.CategoryName = response.data.CategoryName;
                        }
                   }
               }).then(function(response){

           });
       }

       function addGroup(groupToAdd){

           $http.post(settings.apiUrl + settings.groupsEndpoint, groupToAdd)
               .then(function(response){
                   var item = response.data;
                   item.name= item.GroupName;
                   item.type= 'group';
                   item.visible= true;
                   item.Points = [];
                   item.Marker = markersLookup[item.MarkerId];
                   groupsLookup[item.Id] = item;
                   namedGroups[item.GroupName] = item;
                   pointsGrouped.push(item);
                   categoriesLookup[item.CategoryId].groups.push(item);
               })
               .then(function(response){});
       }
       function deleteGroup(){}
       function updateGroup(groupToUpdate){
            $http.put(settings.apiUrl + settings.groupsEndpoint + groupToUpdate.Id, groupToUpdate)
                .then(function(response){
                    var origGroup = groupsLookup[response.data.Id];
                    var origName = origGroup.GroupName;
                    var origCategory = origGroup.CategoryId;
                    origGroup.GroupName = response.data.GroupName;
                    origGroup.MarkerId = response.data.MarkerId;
                    origGroup.CategoryId = response.data.CategoryId;
                    origGroup.Marker = markersLookup[origGroup.MarkerId];
                    var categoryGroup = categoriesLookup[origGroup.CategoryId].groups.find(function(element){
                        return element.Id === response.data.Id;
                    });
                    if(!categoryGroup){ //it was not found in the present category, remove from old category and add to new
                        var removeIndex = categoriesLookup[origCategory].groups.findIndex(function(element){
                            return element.Id === response.data.Id;
                        });
                        categoriesLookup[origCategory].groups.splice(removeIndex, 1);

                        categoriesLookup[origGroup.CategoryId].groups.push(origGroup);
                    }


                    var namedGroup = namedGroups[origName];
                    if(origName !== response.data.GroupName){
                        namedGoups[response.data.GroupName] = namedGroup; //move it to the new name
                        namedGroup.GroupName = response.data.GroupName;
                        namedGroup.MarkerId = response.data.GroupName;
                        namedGroup.CategoryId = response.data.CategoryId;
                        namedGroup.Marker = markersLookup[namedGroup.MarkerId];
                    }

                    var pointGroup = pointsGrouped.find(function(element){
                        return element.Id === response.data.Id;
                    });
                    if(pointGroup){
                        pointGroup.GroupName = response.data.GroupName;
                        pointGroup.MarkerId = response.data.GroupName;
                        pointGroup.CategoryId = response.data.CategoryId;
                        pointGroup.Marker = markersLookup[ pointGroup.MarkerId];
                    }
                })
                .then(function(response){});
       }

       function addMarker(markerSpec){
           var payload = {
                MarkerName: markerSpec.markerName,
                Description: '',
                IconUrl: markerSpec.iconUrl
           };
           $http.post(settings.apiUrl + settings.markersEndpoint, payload)
               .then(function(response){
                   var tempMarker = response.data;
                   var permMarker = markersLookup[tempMarker.Id] = tempMarker;
                   markerList.push(tempMarker);
                   permMarker.iconUrl='markers/' + permMarker.IconUrl;
                   permMarker.iconSize = [38, 95];
                   permMarker.iconAnchor= [22, 94];
                   permMarker.popupAnchor= [-3, -76];
               })
               .then(function(response){});
       }
       function deleteMarker(markerToDelete){
           $http.delete(settings.apiUrl + settings.markersEndpoint + markerToDelete.Id)
               .then(function(response){
                   var indexToDelete = markerList.findIndex(function(element){
                       return element.Id === response.data.Id;
                   });
                   if(indexToDelete > -1){
                       markerList.splice(indexToDelete, 1);
                   }
                   delete markersLookup[response.data.Id];
               })
               .then(function(response){

               });
       }
       function updateMarker(markerToUpdate) {
           $http.put(settings.apiUrl + settings.markersEndpoint + markerToUpdate.Id, markerToUpdate)
               .then(function (response) {
                   var updatedMarker = markerToUpdate;
                   var permMarker = markersLookup[updatedMarker.Id];
                   permMarker.MarkerName = updatedMarker.MarkerName;
                   permMarker.IconUrl = updatedMarker.IconUrl;
                   permMarker.iconUrl='markers/' + permMarker.IconUrl;
               })
               .then(function (response) {
               });
       }

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
                                       cat.CategoryName = item.CategoryName;
                                   }
                               }else{
                                   addAccordionPropertiesToCategory(item);
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
                                   item.iconUrl= settings.markerUrl + markersLookup[item.MarkerId].IconUrl;
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
                                   var group = groupsLookup[item.GroupId];
                                   var point = group.Points.find(function(element){
                                       return element.Id === item.Id;
                                   });
                                   if(point.ModifiedDate < item.ModifiedDate){
                                       pointLookup[item.Id] = item;
                                       item.Marker = markersLookup[item.MarkerId];
                                       //item.title = item.PointName;
                                       item.lat = item.LatCoord;
                                       item.lng = item.LongCoord;
                                       item.draggable = true;
                                       item.layer = groupsLookup[item.GroupId].GroupName;
                                       item.icon = {
                                           iconUrl: settings.markerUrl + markersLookup[item.MarkerId].IconUrl,
                                           iconSize: [36,36],
                                           iconAnchor: [18,18],
                                           popupAnchor: [-3, -76]
                                       };
                                   }
                               }else{

                               }
                               /*pointLookup[item.Id] = item;
                               groupsLookup[item.GroupId].Points.push(pointLookup[item.Id]);
                               pointsUngrouped.push(pointLookup[item.Id]);
                               item.title = item.PointName;
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
                               item.Marker = markersLookup[item.MarkerId];*/
                           });
                       }).then(function(response){

                   });
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
                $http.get(settings.apiUrl + settings.mapPointsEndpoint, {
                    responseType:"json"
                })
                    .then(function(response){
                        response.data.Categories.forEach(function(item, index, array){
                            item.groups = [];
                            addAccordionPropertiesToCategory(item);
                            categoriesLookup[item.Id] = item;
                            categoryList.push(categoriesLookup[item.Id]);
                        });
                        response.data.Markers.forEach(function(item, index, array){
                            markersLookup[item.Id] = item;
                            markerList.push(item);
                            item.iconUrl= settings.markerUrl + item.IconUrl;
                            item.iconSize = [38, 95];
                              item.popupAnchor= [-3, -76];
                            //shadowUrl: 'img/leaf-shadow.png',
                            //shadowSize:   [50, 64], // size of the shadow
                            //shadowAnchor: [4, 62],  // the same for the shadow
                        });
                        response.data.Groups.forEach(function(item, index, array){
                            var category = categoriesLookup[item.CategoryId];
                            //item.name= item.GroupName;
                            item.type= 'group';
                            item.visible= true;
                            item.Points = [];
                            item.Marker = markersLookup[item.MarkerId];
                            groupsLookup[item.Id] = item;
                            namedGroups[item.GroupName] = item;
                            pointsGrouped.push(item);
                            category.Groups.push(item);
                        });
                        response.data.Points.forEach(function(item, index, array){
                            pointLookup[item.Id] = item;
                            groupsLookup[item.GroupId].Points.push(pointLookup[item.Id]);
                            pointsUngrouped.push(pointLookup[item.Id]);
                            item.title = item.PointName;
                            item.lat = item.LatCoord;
                            item.lng = item.LongCoord;
                            item.draggable = true;
                            item.layer = groupsLookup[item.GroupId].GroupName;
                            item.icon = {
                                iconUrl: settings.markerUrl + markersLookup[item.MarkerId].IconUrl,
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
            namedGroups: namedGroups,
            addPoint: addPoint,
            updatePoint: updatePoint,
            categories: categoryList,
            addCategory: addCategory,
            updateCategory: updateCategory,
            deleteCategory: deleteCategory,
            markers:markerList,
            addMarker: addMarker,
            updateMarker: updateMarker,
            deleteMarker: deleteMarker,
            addGroup:addGroup,
            updateGroup:updateGroup,
            markersLookup:markersLookup,
            categoriesLookup:categoriesLookup
       }

   }
]);