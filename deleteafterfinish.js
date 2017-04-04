

//routes js
myApp.config(["$routeProvider", function ($routeProvider) {
    "use strict";
    $routeProvider
        .when("/", {
            templateUrl : "views/login.html",
            controller : "loginCtrl"
        })
        .when("/signup", {
            templateUrl : "views/contact-create-account.html",
            controller : "registrationCtrl"
        })
        .when("/resetpassword", {
            templateUrl : "views/Reset-password.html",
            controller : "resetCtrl"
        })
        .when("/dashboard", {
            templateUrl : "views/dashboard.html",
            controller : "dashboardCtrl",
            authenticated : true
        })
        .when("/profile", {
            templateUrl : "views/profile.html",
            controller : "profileCtrl",
            authenticated : true
        })
        .when("/mail", {
            templateUrl : "views/mailbox.html",
            controller : "mailboxCtrl",
            authenticated : true
        })
        .otherwise("/", {
            templateUrl : "views/login.html"
        });
}]);


//loginCtrl js
myApp.controller("loginCtrl", ["$scope", "authFact", "$location", "$cookies", "$http", function ($scope, authFact, $location, $cookies, $http) {
    "use strict";
    //preloged in routed inside
    var accessToken = $cookies.get("accessToken");
    authFact.setAccessToken(accessToken);
    $location.path("/dashboard");
    
}]);


//dashboardCtrl js
myApp.controller("dashboardCtrl", ["$scope", "$location", "$cookies", "$http", function ($scope, $location, $cookies, $http) {
    "use strict";
    
    
    
    //mailbox page
    $scope.mailbox = function () {$location.path("/mail"); };
    //logout
    $scope.logout = function () {
        $location.path("/");
        $cookies.remove('accessToken');
        $cookies.remove('userData');
    };
}]);

//profileCtrl js
myApp.controller("profileCtrl", ["$scope", "$location", "$cookies", "$http", function ($scope, $location, $cookies, $http) {
    "use strict";
    //mailbox page
    $scope.mailbox = function () {$location.path("/mail"); };
    //dashboard page
    $scope.newsfeed = function () {$location.path("/dashboard"); };
    var allcookies = $cookies.getAll();
    console.log(allcookies);
    //api for user details and all cases
    var udata = JSON.parse($cookies.get('userData'));
    $scope.uid = udata;
    console.log($scope.uid);
    var uiddata = JSON.stringify({
            "User_ID": $scope.uid
        });
    $http({
        method: "POST",
        url: "http://yakensolution.cloudapp.net/Charity/Api/User/UserDetails",
        data: uiddata,
        headers: {'Content-Type': 'application/json'}
    })
        .then(function (response) {
            console.log(response.data);
            //settings user variables
            var mainCookie = response.data;
            console.log(mainCookie);
            $scope.uname = mainCookie.Name;
            $scope.uemail = mainCookie.EMail;
            if (mainCookie.ImgURL === null) {
                $scope.upic = "images/avatar.png";
                console.log($scope.upic);
            } else {
                $scope.upic = mainCookie.ImgURL;
            }
            $scope.uaddress = mainCookie.Address;
            $scope.umobilnumber = mainCookie.MobileNumber;
            $scope.ucategory = mainCookie.InterstedCategory;
            $scope.utrusted = mainCookie.IsTrusted;
            $scope.ugender = mainCookie.Gender;
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
            "User_ID": $scope.uid,
            "UNFollowingID": $scope.unfuserid
        });
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
                    location.reload();
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    
    //add case
    $scope.addcase = function () {
        var udata = JSON.parse($cookies.get('userData')),
            dates = JSON.stringify($scope.casedate),
            month = dates.substr(6, 2),
            day = dates.substr(9, 2),
            year = dates.substr(1, 4);
        $scope.uid = udata;
        $scope.date =  month + "/" + day + "/" + year;
        console.log($scope.date);
        console.log($scope.uid);
        var addcasedata = JSON.stringify({
            "Name": $scope.casename,
            "Amount": $scope.caseamount,
            "CategoryID": $scope.casecat,
            "EndDate": $scope.date,
            "CauseDescription": $scope.casedes,
            "IMG": $scope.caseimg,
            "status": "1",
            "User_ID": $scope.uid
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
                    location.reload();
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
            newyear = dates.substr(1, 4);
        $scope.newdate =  newmonth + "/" + newday + "/" + newyear;
        var caseedit = JSON.stringify({
            "CauseID": $scope.editcaseid,
            "Name": $scope.newcasename,
            "Amount": $scope.newcaseamount,
            "CategoryID": $scope.newcasecat,
            "EndDate": $scope.newdate,
            "CauseDescription": $scope.newcasedes,
            "IMG": $scope.newcaseimg,
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
                    location.reload();
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
                    location.reload();
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
                    location.reload();
                }
            }, function (reason) {
                console.log(reason.data);
            });
    };
    
    // change image
    $scope.updateimage = function () {
        if ($scope.newimage === undefined) {
            console.log("no image choosen");
            console.log($scope.newimage);
            //console.log("http://yakensolution.cloudapp.net/Charity/Api/User/AddPicture?User_ID=" + $scope.uid);
        } else {
            var updataimg = JSON.stringify({
                "Img": $scope.newimage
            });
            console.log($scope.newimage);
            //console.log("http://yakensolution.cloudapp.net/Charity/Api/User/AddPicture?User_ID=" + $scope.uid);
            $http({
                method: "POST",
                url: "http://yakensolution.cloudapp.net/Charity/Api/User/AddPicture?User_ID=" + $scope.uid,
                data: updataimg
            })
                .then(function (response) {
                    console.log(response.data);
                    if (!response.data.IsSuccess) {
                        console.log("error");
                    } else {
                        location.reload();
                    }
                }, function (reason) {
                    console.log(reason.data);
                });
        }
        
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
            "UserID": $scope.uid,
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

    //logout
    $scope.logout = function () {
        $cookies.remove('accessToken');
        $cookies.remove('userData');
        $location.path("/");
    };
}]);

//mailboxCtrl js
myApp.controller("mailboxCtrl", ["$scope", "$location", "$cookies", "$http", function ($scope, $location, $cookies, $http) {
    "use strict";
    //dashboard page
    $scope.newsfeed = function () {$location.path("/dashboard"); };
    //profile page
    $scope.profile = function () {$location.path("/profile"); };
    var allcookies = $cookies.getAll();
    console.log(allcookies);
    //user id
    var udata = JSON.parse($cookies.get('userData'));
    $scope.uid = udata;
    console.log($scope.uid);
    var uiddata = JSON.stringify({
            "User_ID": $scope.uid
        });
    // get user details
    $http({
        method: "POST",
        url: "http://yakensolution.cloudapp.net/Charity/Api/User/UserDetails",
        data: uiddata,
        headers: {'Content-Type': 'application/json'}
    })
        .then(function (response) {
            console.log(response.data);
            //settings user variables
            var mainCookie = response.data;
            console.log(mainCookie);
            $scope.uname = mainCookie.Name;
            $scope.uemail = mainCookie.EMail;
            if (mainCookie.ImgURL === null) {
                $scope.upic = "images/avatar.png";
                console.log($scope.upic);
            } else {
                $scope.upic = mainCookie.ImgURL;
            }
            $scope.uaddress = mainCookie.Address;
            $scope.umobilnumber = mainCookie.MobileNumber;
            $scope.ugender = mainCookie.Gender;
            //my cases
            $scope.myCases = response.data.MyCases;
            //followed cases
            $scope.followCases = response.data.JoinedCases;
        }, function (reason) {
            $scope.detailerror = reason.data;
            console.log(reason.data);
        });
    // get user inbox
    $http({
        method: "POST",
        url: "http://yakensolution.cloudapp.net/Charity/Api/Messeging/Inbox",
        data: uiddata,
        headers: {'Content-Type': 'application/json'}
    })
        .then(function (response) {
            console.log(response.data);
            //settings user variables
            var inbox = response.data;
            if (response.data.IsSuccess) {
                $scope.messages = inbox.ListOfMasseges;
            } else {
                console.log("error");
            }
        }, function (reason) {
            $scope.inboxerror = reason.data;
            console.log(reason.data);
        });
    
    //logout
    $scope.logout = function () {
        $cookies.remove('accessToken');
        $cookies.remove('userData');
        $location.path("/");
    };
}]);

