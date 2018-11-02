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
                       iconUrl: settings.markerUrl + markersLookup[newPoint.MarkerId].IconUrl,
                       iconSize: [25,25],
                       iconAnchor: [15,15],
                       popupAnchor: [0, -10]
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
               Id: point.Id,
               PointName: point.PointName,
               LatCoord: point.LatCoord,
               LongCoord: point.LongCoord,
               Link: point.Link,
               Description: point.Description,
               GroupId: point.GroupId,
               MarkerId: point.MarkerId
           };
           $http.put(settings.apiUrl + settings.mapPointsEndpoint + payload.Id, payload)
               .then(function(response){
                   if(response.data === ""){ //api returns empty set when successful
                       var lookupPoint = pointLookup[point.Id];
                       var groupPoint = groupsLookup[point.GroupId].Points.find(function(element){
                           return element.Id === point.Id;
                       });
                       var ungroupPoint = pointsUngrouped.find(function(element){
                           return element.Id === point.Id;
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
           oldPoint.LatCoord = newPoint.LatCoord;
           oldPoint.LongCoord = newPoint.LongCoord;
           oldPoint.Link = newPoint.Link;
           oldPoint.Description = newPoint.Description;
           oldPoint.GroupId = newPoint.GroupId;
           oldPoint.MarkerId = newPoint.MarkerId;
           oldPoint.title = newPoint.PointName;
           oldPoint.lat = newPoint.LatCoord;
           oldPoint.lng = newPoint.LongCoord;
           oldPoint.layer = groupsLookup[newPoint.GroupId].GroupName;
           oldPoint.icon = {
               iconUrl: 'markers/' + markersLookup[newPoint.MarkerId].IconUrl,
               iconSize: [25,25],
               iconAnchor: [15,15],
               popupAnchor: [0, -10]
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
                   groupList.push(item);
                   namedGroups[item.GroupName] = item;
                   pointsGrouped.push(item);
                   categoriesLookup[item.CategoryId].groups.push(item);

                   categoriesLookup[item.CategoryId].Groups.push(item);
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
                   permMarker.iconSize= [25,25];
                   permMarker.iconAnchor = [15,15];
                   permMarker.popupAnchor = [0, -10];
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
                                           iconUrl: settings.markerUrl + markersLookup[item.MarkerId].IconUrl,
                                           iconSize: [25,25],
                                           iconAnchor: [15,15],
                                           popupAnchor: [0, -10]
                                       };

                                   }
                                   else{ //its a new point!
                                       pointLookup[item.Id] = item;
                                       //groupsLookup[item.GroupId].Points.push(pointLookup[item.Id]);
                                       pointsUngrouped.push(pointLookup[item.Id]);
                                       //item.title = item.PointName;
                                       item.lat = item.LatCoord;
                                       item.lng = item.LongCoord;
                                       item.draggable = true;
                                       item.layer = groupsLookup[item.GroupId].GroupName;
                                       item.icon = {
                                           iconUrl: settings.markerUrl + markersLookup[item.MarkerId].IconUrl,
                                           iconSize: [25,25],
                                           iconAnchor: [15,15],
                                           popupAnchor: [0, -10]
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

       function findAndSplice(id, searchArray){
           var foundIndex = searchArray.findIndex(function(element){
               return element.Id === id;
           });
           if (foundIndex > -1) {
               searchArray.splice(foundIndex, 1);
           }
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
                                    iconSize: [25,25],
                                    iconAnchor: [15,15],
                                    popupAnchor: [0, -10]
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
            groupList: groupList,
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