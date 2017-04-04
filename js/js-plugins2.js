/*global $, angular, console, alert*/
// app js
var myApp = angular.module("myApp", ["ngRoute", "ngCookies"]);

//main page js


//routes js
myApp.config(["$routeProvider", function ($routeProvider) {
    "use strict";
    $routeProvider
        .when("/", {
            templateUrl : "pages/inside/newsfeed.html",
            controller : "newsfeedCtrl",
            authenticated : true
        })
        .when("/profile", {
            templateUrl : "pages/inside/profile.html",
            controller : "profileCtrl",
            authenticated : true
        })
        .when("/visitprofile", {
            templateUrl : "pages/inside/visitprofile.html",
            controller : "visitprofileCtrl",
            authenticated : true
        })
        .when("/mail", {
            templateUrl : "pages/inside/mailbox.html",
            controller : "mailCtrl",
            authenticated : true
        })
        .otherwise("/", {
            templateUrl : "pages/inside/newsfeed.html",
            controller : "newsfeedCtrl",
            authenticated : true
        });
}]);

//generalCtrl js
myApp.controller("generalCtrl", ["$scope", "$location", "$cookies", "$http", function ($scope, $location, $cookies, $http) {
    "use strict";
    var auth = $cookies.get('accessID');
    console.log(auth);
    if (auth === undefined || auth === null || auth === "" || auth === " " || auth === "00000000-0000-0000-0000-000000000000") {
        window.location.href = 'account.html';
    }
    //getting user id from cookie
    var userid = JSON.parse(auth),
        userdetailsdata = JSON.stringify({
            "User_ID": userid
        });
    console.log(userid);
    $scope.signOut = function () {
        $cookies.remove('accessID');
        $cookies.remove('visitID');
        window.location.href = 'account.html';
    };
    //user details
    $http({
        method: "POST",
        url: "http://yakensolution.cloudapp.net/Charity/Api/User/UserDetails",
        data: userdetailsdata
    })
        .then(function (response) {
            console.log(response.data);
            //settings user variables
            $scope.uname = response.data.Name;
            if (response.data.ImgURL === null || response.data.ImgURL === "") {
                $scope.upic = "images/avatar.png";
                console.log($scope.upic);
            } else {
                $scope.upic = response.data.ImgURL;
            }
        }, function (reason) {
            $scope.userdetailerror = reason.data;
            console.log(reason.data);
        });
    //search
    $scope.searchusercases = function () {
        var searchdata = JSON.stringify({
            "SearchWord": $scope.searchword,
            "SearchType": $scope.searchtype,
            "User_ID": userid
        });
        console.log(searchdata);
        $http({
            method: "POST",
            url: "http://yakensolution.cloudapp.net/Charity/Api/User/Search",
            data: searchdata,
            headers: {'Content-Type': 'application/json'}
        })
            .then(function (response) {
                console.log(response.data);
                if (response.data.IsSuccess) {
                    if ($scope.searchtype === "1") {
                        $scope.searchcases = response.data.SearchedCases;
                        console.log($scope.searchcases);
                        $('#searchcases').modal("show");
                    } else if ($scope.searchtype === "2") {
                        $scope.searchusers = response.data.SearchedPepole;
                        console.log($scope.searchusers);
                        $('#searchusers').modal("show");
                    }
                } else {
                    $scope.errormessage = response.data.ErrorMessage;
                    $('#errormessage').modal("show");
                }
            }, function (reason) {
                $scope.searchdataerror = reason.data;
                console.log(reason.data);
            });
    };
    // join case
    $scope.selectjoincase = function (joincase) {
        console.log(joincase);
        $scope.joincaseid = joincase;
        console.log($scope.joincaseid);
        $('#joincasemodal').modal("show");
    };
    $scope.joincase = function () {
        var casejoin = JSON.stringify({
            "User_ID": userid,
            "CaseID": $scope.joincaseid,
            "DonationValue": "1"
        });
        $http({
            method: "POST",
            url: "http://yakensolution.cloudapp.net/Charity/Api/User/Donation",
            data: casejoin,
            headers: {'Content-Type': 'application/json'}
        })
            .then(function (response) {
                console.log(response.data);
                if (!response.data.IsSuccess) {
                    $scope.errormessage = response.data.ErrorMessage;
                    $('#errormessage').modal("show");
                } else {
                    $('#joincasemodal').modal("hide");
                    $('#searchcases').modal("hide");
                    location.reload();
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    // follow user
    $scope.selectfollowuser = function (fuser) {
        console.log(fuser);
        $scope.fuserid = fuser;
        console.log($scope.fuserid);
        $('#fusermodal').modal("show");
    };
    $scope.followuser = function () {
        var userfollow = JSON.stringify({
            "User_ID": userid,
            "FollowingID": $scope.fuserid
        });
        $http({
            method: "POST",
            url: "http://yakensolution.cloudapp.net/Charity/Api/User/Follow",
            data: userfollow,
            headers: {'Content-Type': 'application/json'}
        })
            .then(function (response) {
                console.log(response.data);
                if (response.data.IsSuccess) {
                    $('#fusermodal').modal("hide");
                    $('#searchusers').modal("hide");
                } else {
                    $scope.errormessage = response.data.ErrorMessage;
                    $('#errormessage').modal("show");
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    // unfollow user
    $scope.selectunfollowm = function (unfollowuserm) {
        console.log(unfollowuserm);
        $scope.unfuseridm = unfollowuserm;
        console.log($scope.unfuseridm);
        $('#searchusers').modal("hide");
        $('#unfollowconfirmm').modal("show");
    };
    $scope.unfollowm = function () {
        var userunfollowm = JSON.stringify({
            "User_ID": userid,
            "UNFollowingID": $scope.unfuseridm
        });
        $http({
            method: "POST",
            url: "http://yakensolution.cloudapp.net/Charity/Api/User/UNFollow",
            data: userunfollowm
        })
            .then(function (response) {
                console.log(response.data);
                if (!response.data.IsSuccess) {
                    $('#caseerror').modal("show");
                } else {
                    $('#unfollowconfirmm').modal("hide");
                    $('#followingmeusers').modal("hide");
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    // visit profile
    $scope.visituser = function (vuid) {
        console.log(vuid);
        // if selects him self
        if (vuid === userid) {
            console.log("same");
            $('#searchusers').modal("hide");
            if ($location.path() === "/profile") {
                location.reload();
            } else {
                $location.path("/profile");
            }
        } else {
            console.log("diff");
            $cookies.putObject('visitID', vuid);
            $('#searchusers').modal("hide");
            if ($location.path() === "/visitprofile") {
                location.reload();
            } else {
                $location.path("/visitprofile");
            }
        }
    };
}]);
//newsfeedCtrl js
myApp.controller("newsfeedCtrl", ["$scope", "$location", "$cookies", "$http", function ($scope, $location, $cookies, $http) {
    "use strict";
    //api for user details and all cases
    var udata = JSON.parse($cookies.get('accessID')),
        uiddata = JSON.stringify({
            "User_ID": udata
        });
    // get newsfeed
    $http({
        method: "POST",
        url: "http://yakensolution.cloudapp.net/Charity/Api/User/Newsfeed",
        data: uiddata
    })
        .then(function (response) {
            console.log(response.data);
            //settings user newsfeed
            var newsfeed = response.data;
            //my newsfeed
            $scope.mycasesnews = response.data.MyANDJoinedCasesList;
            $scope.fcasesnews = response.data.FollowingCassesList;
            console.log($scope.fcasesnews);
            $scope.allcasesnews = $scope.mycasesnews.concat($scope.fcasesnews);
            console.log($scope.allcasesnews);
        }, function (reason) {
            $scope.detailerror = reason.data;
            console.log(reason.data);
        });
    //profile page
    $scope.profile = function () {$location.path("/profile"); };
}]);
//profileCtrl js
myApp.controller("profileCtrl", ["$scope", "$route", "$location", "$cookies", "$http", function ($scope, $route, $location, $cookies, $http) {
    "use strict";
    var udata = JSON.parse($cookies.get('accessID')),
        uiddata = JSON.stringify({
            "User_ID": udata
        });
    $http({
        method: "POST",
        url: "http://yakensolution.cloudapp.net/Charity/Api/User/UserDetails",
        data: uiddata
    })
        .then(function (response) {
            console.log(response.data);
            //settings user variables
            $scope.uname = response.data.Name;
            $scope.uemail = response.data.EMail;
            if (response.data.ImgURL === null || response.data.ImgURL === "") {
                $scope.upic = "images/avatar.png";
                console.log($scope.upic);
            } else {
                $scope.upic = response.data.ImgURL;
            }
            $scope.uaddress = response.data.Address;
            $scope.umobilnumber = response.data.MobileNumber;
            $scope.ucategory = response.data.InterstedCategory;
            $scope.utrusted = response.data.IsTrusted;
            $scope.ugender = response.data.Gender;
            //my cases
            $scope.myCases = response.data.MyCases;
            //followed cases
            $scope.followCases = response.data.JoinedCases;
        }, function (reason) {
            $scope.detailerror = reason.data;
            console.log(reason.data);
        });
    //get category list
    $http({
        method: "POST",
        url: "http://yakensolution.cloudapp.net/Charity/Api/Category/GetAllCategories",
        data: uiddata,
        headers: {'Content-Type': 'application/json'}
    })
        .then(function (response) {
            $scope.allcasesreply = response.data;
            console.log(response.data);
            //all category cases
            $scope.allcases = $scope.allcasesreply.AllCategories;
        }, function (reason) {
            $scope.allcaseserror = reason.data;
            console.log(reason.data);
        });
    //get country list
    $http({
        method: "POST",
        url: "http://yakensolution.cloudapp.net/Charity/Api/Country/AllCountries",
        data: null,
        headers: {'Content-Type': 'application/json'}
    })
        .then(function (response) {
            console.log(response.data);
            $scope.allcountries = response.data.AllCountries;
        }, function (reason) {
            $scope.allcaseserror = reason.data;
            console.log(reason.data);
        });
    //get city list
    $scope.getcity = function (getcityincountry) {
        var citydata = JSON.stringify({
                "CountryID": $scope.newcountry
            });
        $http({
            method: "POST",
            url: "http://yakensolution.cloudapp.net/Charity/Api/Country/AllCities",
            data: citydata,
            headers: {'Content-Type': 'application/json'}
        })
            .then(function (response) {
                console.log(response.data);
                $scope.allcities = response.data.AllCities;
            }, function (reason) {
                $scope.allcitieserror = reason.data;
                console.log(reason.data);
            });
    };
    // getting users following me
    $http({
        method: "POST",
        url: "http://yakensolution.cloudapp.net/Charity/Api/Following/ListofFollowers",
        data: uiddata,
        headers: {'Content-Type': 'application/json'}
    })
        .then(function (response) {
            console.log(response.data);
            $scope.followingme = response.data.ListOFFollowers;
        }, function (reason) {
            console.log(reason.data);
        });
    // getting users i follow
    $http({
        method: "POST",
        url: "http://yakensolution.cloudapp.net/Charity/Api/Following/ListofPepole",
        data: uiddata,
        headers: {'Content-Type': 'application/json'}
    })
        .then(function (response) {
            console.log(response.data);
            $scope.mefollowing = response.data.ListofPepoleFollowing;
        }, function (reason) {
            console.log(reason.data);
        });
    // unfollow user
    $scope.selectunfollow = function (unfollowuser) {
        console.log(unfollowuser);
        $scope.unfuserid = unfollowuser;
        console.log($scope.unfuserid);
        $('#mefollowingusers').modal("hide");
        $('#unfollowconfirm').modal("show");
    };
    $scope.unfollow = function () {
        var userunfollow = JSON.stringify({
            "User_ID": udata,
            "UNFollowingID": $scope.unfuserid
        });
        console.log();
        $http({
            method: "POST",
            url: "http://yakensolution.cloudapp.net/Charity/Api/User/UNFollow",
            data: userunfollow,
            headers: {'Content-Type': 'application/json'}
        })
            .then(function (response) {
                console.log(response.data);
                if (!response.data.IsSuccess) {
                    $('#caseerror').modal("show");
                } else {
                    $('#unfollowconfirm').modal("hide");
                    $('#followingmeusers').modal("hide");
                    $(".modal-backdrop").remove();
                    $route.reload();
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //add case
    $scope.addcase = function () {
        var dates = JSON.stringify($scope.casedate),
            month = dates.substr(6, 2),
            day = dates.substr(9, 2),
            year = dates.substr(1, 4),
            addcasedata = JSON.stringify({
                "Name": $scope.casename,
                "Amount": $scope.caseamount,
                "CategoryID": $scope.casecat,
                "EndDate": month + "/" + day + "/" + year,
                "CauseDescription": $scope.casedes,
                "status": "1",
                "User_ID": udata
            });
        console.log(addcasedata);
        $http({
            method: "POST",
            url: "http://yakensolution.cloudapp.net/Charity/Api/Case/AddCause",
            data: addcasedata,
            headers: {'Content-Type': 'application/json'}
        })
            .then(function (response) {
                if (!response.data.IsSuccess) {
                    $('#caseerror').modal("show");
                } else {
                    $('#addcase').modal("hide");
                    $('#allmycases').modal("hide");
                    $(".modal-backdrop").remove();
                    $route.reload();
                }
            }, function (reason) {
                $scope.adderror = reason.data;
                console.log(reason.data);
            });
    };
    // edit case
    $scope.selecteditcase = function (edcase) {
        console.log(edcase);
        $scope.editcaseid = edcase;
        console.log($scope.editcaseid);
        $('#editcase').modal("show");
    };
    $scope.editcase = function () {
        var dates = JSON.stringify($scope.newcasedate),
            newmonth = dates.substr(6, 2),
            newday = dates.substr(9, 2),
            newyear = dates.substr(1, 4),
            caseedit = JSON.stringify({
                "CauseID": $scope.editcaseid,
                "Name": $scope.newcasename,
                "Amount": $scope.newcaseamount,
                "CategoryID": $scope.newcasecat,
                "EndDate": newmonth + "/" + newday + "/" + newyear,
                "CauseDescription": $scope.newcasedes,
                "status": "1"
            });
        $http({
            method: "POST",
            url: "http://yakensolution.cloudapp.net/Charity/Api/Case/EditCause",
            data: caseedit,
            headers: {'Content-Type': 'application/json'}
        })
            .then(function (response) {
                console.log(response.data);
                if (!response.data.IsSuccess) {
                    $('#caseerror').modal("show");
                } else {
                    $('#editcase').modal("hide");
                    $('#allmycases').modal("hide");
                    $(".modal-backdrop").remove();
                    $route.reload();
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    // delete case
    $scope.selectdeletecase = function (delcase) {
        console.log(delcase);
        $scope.deletecaseid = delcase;
        console.log($scope.deletecaseid);
        $('#deletecase').modal("show");
    };
    $scope.deletecase = function () {
        var casedelete = JSON.stringify({
            "CauseID": $scope.deletecaseid,
            "ActionType": "1"
        });
        $http({
            method: "POST",
            url: "http://yakensolution.cloudapp.net/Charity/Api/Case/DeleteCause",
            data: casedelete,
            headers: {'Content-Type': 'application/json'}
        })
            .then(function (response) {
                console.log(response.data);
                if (!response.data.IsSuccess) {
                    $('#caseerror').modal("show");
                } else {
                    $('#deletecase').modal("hide");
                    $('#allmycases').modal("hide");
                    $(".modal-backdrop").remove();
                    $route.reload();
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    // complete case
    $scope.selectcompletecase = function (comcase) {
        console.log(comcase);
        $scope.completecaseid = comcase;
        console.log($scope.completecaseid);
        $('#completecase').modal("show");
    };
    $scope.completecase = function () {
        var casedelete = JSON.stringify({
            "CauseID": $scope.completecaseid,
            "ActionType": "2"
        });
        $http({
            method: "POST",
            url: "http://yakensolution.cloudapp.net/Charity/Api/Case/DeleteCause",
            data: casedelete,
            headers: {'Content-Type': 'application/json'}
        })
            .then(function (response) {
                console.log(response.data);
                if (!response.data.IsSuccess) {
                    $('#caseerror').modal("show");
                } else {
                    $('#completecase').modal("hide");
                    $('#allmycases').modal("hide");
                    $(".modal-backdrop").remove();
                    $route.reload();
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    //update data
    $scope.updatedata = function () {
        //if name unchanged
        if ($scope.newname === undefined || $scope.newname === null) {
            $scope.snewname = $scope.uname;
        } else {
            $scope.snewname = $scope.newname;
        }
        //if email unchanged
        if ($scope.newemail === undefined || $scope.newemail === null) {
            $scope.snewemail = $scope.uemail;
        } else {
            $scope.snewemail = $scope.newemail;
        }
        //if mobile number unchanged
        if ($scope.newmobile === undefined || $scope.newmobile === null) {
            $scope.snewmobile = $scope.umobilnumber;
        } else {
            $scope.snewmobile = $scope.newmobile;
        }
        //if address unchanged
        if ($scope.newcity === undefined || $scope.newcity === null) {
            $scope.snewcity = $scope.uaddress;
        } else {
            $scope.snewcity = $scope.newcity;
        }
        //if gender unchanged
        if ($scope.newgender === undefined || $scope.newgender === null) {
            $scope.snewgender = $scope.ugender;
        } else {
            $scope.snewgender = $scope.newgender;
        }
        var updata = JSON.stringify({
            "UserID": udata,
            "Name": $scope.snewname,
            "Password": $scope.newpass,
            "EMail": $scope.snewemail,
            "MobileNumber": $scope.snewmobile,
            "Address": $scope.snewcity,
            "Gender": $scope.snewgender,
            "InterestedCategory": $scope.newcat
        });
        console.log(updata);
        $http({
            method: "POST",
            url: "http://yakensolution.cloudapp.net/Charity/Api/User/EditProfile",
            data: updata,
            headers: {'Content-Type': 'application/json'}
        })
            .then(function (response) {
                $scope.updatereply = response.data;
                console.log(response.data);
                if (response.data.IsSuccess) {
                    $('#updatedata').modal("hide");
                    //if email changed
                    if ($scope.uemail === $scope.snewemail) {
                        location.reload();
                    } else {
                        $cookies.remove('accessToken');
                        $cookies.remove('userData');
                        $location.path("/");
                    }
                } else {
                    $('#updatedata').modal("hide");
                    $('#updatedataerror').modal("show");
                }
            }, function (reason) {
                $scope.updateerror = reason.data;
                console.log(reason.data);
            });
    };
    // visit profile
    $scope.visituser = function (vuid) {
        console.log(vuid);
        // if selects him self
        if (vuid === udata) {
            console.log("same");
            $('#mefollowingusers').modal("hide");
            $('#followingmeusers').modal("hide");
            $(".modal-backdrop").remove();
            $location.path("/profile");
        } else {
            console.log("diff");
            $cookies.putObject('visitID', vuid);
            $('#mefollowingusers').modal("hide");
            $('#followingmeusers').modal("hide");
            $(".modal-backdrop").remove();
            $location.path("/visitprofile");
        }
    };
}]);
//visitprofileCtrl js
myApp.controller("visitprofileCtrl", ["$scope", "$route", "$location", "$cookies", "$http", function ($scope, $route, $location, $cookies, $http) {
    "use strict";
    var udata = JSON.parse($cookies.get('accessID')),
        visteduser = JSON.parse($cookies.get('visitID')),
        uiddata = JSON.stringify({
            "User_ID": udata
        }),
        vuiddata = JSON.stringify({
            "User_ID": visteduser
        });
    $http({
        method: "POST",
        url: "http://yakensolution.cloudapp.net/Charity/Api/User/UserDetails",
        data: vuiddata
    })
        .then(function (response) {
            console.log(response.data);
            //settings user variables
            $scope.vuname = response.data.Name;
            $scope.vuemail = response.data.EMail;
            if (response.data.ImgURL === null || response.data.ImgURL === "") {
                $scope.vupic = "images/avatar.png";
                console.log($scope.vupic);
            } else {
                $scope.vupic = response.data.ImgURL;
            }
            $scope.vuaddress = response.data.Address;
            $scope.vumobilnumber = response.data.MobileNumber;
            $scope.vucategory = response.data.InterstedCategory;
            $scope.vutrusted = response.data.IsTrusted;
            $scope.vugender = response.data.Gender;
            //my cases
            $scope.vmyCases = response.data.MyCases;
        }, function (reason) {
            $scope.detailerror = reason.data;
            console.log(reason.data);
        });
    // getting users following me
    $http({
        method: "POST",
        url: "http://yakensolution.cloudapp.net/Charity/Api/Following/ListofFollowers",
        data: vuiddata,
        headers: {'Content-Type': 'application/json'}
    })
        .then(function (response) {
            console.log(response.data);
            $scope.vfollowingme = response.data.ListOFFollowers;
            $scope.vfollowingme.map(function (person) {
                if (person.FollowID === udata) {
                    $scope.alreadyfollow = true;
                }
            });
        }, function (reason) {
            console.log(reason.data);
        });
    // getting users i follow
    $http({
        method: "POST",
        url: "http://yakensolution.cloudapp.net/Charity/Api/Following/ListofPepole",
        data: vuiddata,
        headers: {'Content-Type': 'application/json'}
    })
        .then(function (response) {
            console.log(response.data);
            $scope.vmefollowing = response.data.ListofPepoleFollowing;
        }, function (reason) {
            console.log(reason.data);
        });
    // unfollow user
    $scope.unfollowvisited = function () {
        var userunfollow = JSON.stringify({
            "User_ID": udata,
            "UNFollowingID": visteduser
        });
        console.log();
        $http({
            method: "POST",
            url: "http://yakensolution.cloudapp.net/Charity/Api/User/UNFollow",
            data: userunfollow,
            headers: {'Content-Type': 'application/json'}
        })
            .then(function (response) {
                console.log(response.data);
                if (!response.data.IsSuccess) {
                    $scope.errormessage = response.data.ErrorMessage;
                    $('#caseerror').modal("show");
                } else {
                    $route.reload();
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    // follow user
    $scope.followvisited = function () {
        var userfollow = JSON.stringify({
            "User_ID": udata,
            "FollowingID": visteduser
        });
        $http({
            method: "POST",
            url: "http://yakensolution.cloudapp.net/Charity/Api/User/Follow",
            data: userfollow,
            headers: {'Content-Type': 'application/json'}
        })
            .then(function (response) {
                console.log(response.data);
                if (response.data.IsSuccess) {
                    $route.reload();
                } else {
                    $scope.errormessage = response.data.ErrorMessage;
                    $('#caseerror').modal("show");
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
}]);
//mailCtrl js
myApp.controller("mailCtrl", ["$scope", "$location", "$cookies", "$http", function ($scope, $location, $cookies, $http) {
    "use strict";
    var udata = JSON.parse($cookies.get('accessID')),
        uiddata = JSON.stringify({
            "User_ID": udata
        });
    $http({
        method: "POST",
        url: "http://yakensolution.cloudapp.net/Charity/Api/Messeging/Inbox",
        data: uiddata
    })
        .then(function (response) {
            console.log(response.data);
            if (response.data.IsSuccess) {
                $scope.inboxmessages = response.data.ListOfMasseges;
            } else {
                $scope.errorMSG = response.data.ErrorMessage;
                $('#errormail').modal("show");
            }
        }, function (reason) {
            $scope.mailerror = reason.data;
            console.log(reason.data);
        });
    $scope.readmail = function (thread, date) {
        $('a[data-target="#inbox"]').tab('show');
        console.log(thread);
        console.log(date);
        var recivemsg = JSON.stringify({
                "ThreadID": thread,
                "MasgDate": date,
                "User_ID": udata
            });
        console.log(recivemsg);
        /*
        $http({
            method: "POST",
            url: "http://yakensolution.cloudapp.net/Charity/Api/Messeging/RecieveMassege",
            data: recivemsg
        })
            .then(function (response) {
                console.log(response.data);
                if (response.data.IsSuccess) {
                    $scope.restofmsgs = response.data;
                    $scope.allmsgs = response.data.MSgs;
                } else {
                    console.log(response.data.ErrorMessage);
                }
            }, function (reason) {
                $scope.allcitieserror = reason.data;
                console.log(reason.data);
            });
            */
    };
}]);
//composeCtrl js
myApp.controller("composeCtrl", ["$scope", "$location", "$cookies", "$http", function ($scope, $location, $cookies, $http) {
    "use strict";
    //mailbox page
    $scope.mailbox = function () {$location.path("/mail"); };
}]);
//readmailCtrl js
myApp.controller("readmailCtrl", ["$scope", "$location", "$cookies", "$http", function ($scope, $location, $cookies, $http) {
    "use strict";
  
}]);
//check for authentications
myApp.run(["$rootScope", "$location", "$cookies", function ($rootScope, $location, $cookies) {
    "use strict";
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        if (next.$$route.authenticated) {
            var auth = $cookies.get('accessID');
            console.log(auth);
            if (auth === undefined || auth === null || auth === "" || auth === " " || auth === "00000000-0000-0000-0000-000000000000") {
                window.location.href = 'account.html';
            }
        }
    });
}]);

/*
myApp.factory('dataService', function () {
    "use strict";
    var savedData = {};
    function set(data) {
        savedData = data;
    }
    function get() {
        return savedData;
    }
    return {
        set: set,
        get: get
    };
});


    dataService.set("ahmed in newsfeed");
    
    
    $scope.desiredLocation = dataService.get();
    console.log($scope.desiredLocation);
*/

/*


//authFact js
myApp.factory("authFact", ["$cookies", function ($cookies) {
    "use strict";
    var authFact = {};
    authFact.setAccessToken = function (accessToken) {
        $cookies.put("accessToken", accessToken);
    };
    authFact.getAccessToken = function () {
        authFact.authToken = $cookies.get("accessToken");
        return authFact.authToken;
    };
    return authFact;
}]);

//check for authentications
myApp.run(["$rootScope", "$location", "authFact", function ($rootScope, $location, authFact) {
    "use strict";
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        if (next.$$route.authenticated) {
            var userAuth = authFact.getAccessToken();
            if (!userAuth) {
                //$location.path("/profile");
                window.location = "/account.html";
            }
        }
    });
}]);
*/