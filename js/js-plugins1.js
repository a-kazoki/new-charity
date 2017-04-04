/*global $, angular, FB, console*/
// app js
var mainApp = angular.module("mainApp", ["ngRoute", "ngCookies"]);

//routes js
mainApp.config(["$routeProvider", function ($routeProvider) {
    "use strict";
    $routeProvider
        .when("/", {
            templateUrl : "pages/outside/Log-in.html",
            controller : "loginCtrl"
        })
        .when("/registration", {
            templateUrl : "pages/outside/contact-create-account.html",
            controller : "registrationCtrl"
        })
        .when("/resetpassword", {
            templateUrl : "pages/outside/Reset-password.html",
            controller : "resetCtrl"
        })
        .otherwise("/", {
            templateUrl : "pages/outside/Log-in.html",
            controller : "loginCtrl"
        });
}]);

//loginCtrl js
mainApp.controller("loginCtrl", ["$scope", "$location", "$cookies", "$http", function ($scope, $location, $cookies, $http) {
    "use strict";
    //facebook app ready
    window.fbAsyncInit = function () {
        FB.init({
            appId      : '395476837465709',
            xfbml      : true,
            version    : 'v2.8'
        });
        FB.AppEvents.logPageView();
    };
    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return; }
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    //user password login
    $scope.UPsign = function () {
        var logindata = JSON.stringify({
            "Email": $scope.UPemail,
            "Password": $scope.UPpass
        });
        $http({
            method: "POST",
            url: "http://yakensolution.cloudapp.net/Charity/Api/User/Login",
            data: logindata,
            headers: {'Content-Type': 'application/json'}
        })
            .then(function (response) {
                $scope.UPlogreply = response.data;
                $scope.saveuserid = response.data.User_ID;
                console.log(response.data);
                if ($scope.UPlogreply.Is_Verified) {
                    if ($scope.remember) {
                        var now = new Date(),
                            exp = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
                        $cookies.putObject('accessID', response.data.User_ID, {expires: exp});
                        window.location.href = 'access.html';
                    } else {
                        $cookies.putObject('accessID', response.data.User_ID);
                        window.location.href = 'access.html';
                    }
                } else if ($scope.UPlogreply.IsSuccess) {
                    $('#unverlog').modal("show");
                } else {
                    $scope.ErrorMSG = response.data.ErrorMessage;
                    $('#loginerror').modal("show");
                }
            }, function (reason) {
                $scope.UPlogerror = reason.data;
                console.log(reason.data);
            });
    };
    //unverified login
    $scope.unverlog = function () {
        console.log($scope.UPlogreply.User_ID);
        console.log($scope.verCodelog);
        var data = {
            "User_ID" : $scope.UPlogreply.User_ID,
            "VerficationCode": $scope.verCodelog
        };
        $http({
            method: "POST",
            url: "http://yakensolution.cloudapp.net/Charity/Api/User/VerfiedAccnt",
            data: data,
            headers: {'Content-Type': 'application/json'}
        })
            .then(function (response) {
                $scope.unverlogReply = response.data;
                console.log(response.data);
                if ($scope.unverlogReply.IsSuccess) {
                    $('#unverlog').modal("hide");
                    $cookies.putObject('accessID', $scope.saveuserid);
                    window.location.href = 'access.html';
                } else {
                    $('#unverlog').modal("hide");
                    $scope.ErrorMSG = response.data.ErrorMessage;
                    $('#loginerror').modal("show");
                }
            }, function (reason) {
                $scope.unverlogError = reason.data;
                console.log(reason.data);
            });
    };
    //facebook login
    $scope.FBLogin = function () {
        FB.login(function (response) {
            if (response.authResponse) {
                console.log('Welcome!  Fetching your information.... ');
                FB.api('/me', {fields: 'id,name,email,picture,gender'}, function (response) {
                    console.log('Good to see you, ' + response.name + '.');
                    console.log(response);
                    var data = JSON.stringify({
                        "Name": response.name,
                        "ImgURL" : response.picture.data.url,
                        "FacebookID" : response.id,
                        "Login_Type": "2",
                        "EMail": response.email,
                        "Gender": response.gender
                    });
                    console.log(data);
                    $http({
                        method: "POST",
                        url: "http://yakensolution.cloudapp.net/Charity/Api/User/Regesteration",
                        data: data,
                        headers: {'Content-Type': 'application/json'}
                    })
                        .then(function (response) {
                            $scope.fbReply = response.data;
                            if ($scope.fbReply.IsSuccess) {
                                var now = new Date(),
                                    exp = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
                                $cookies.putObject('accessID', response.data.UserID, {expires: exp});
                                window.location.href = 'access.html';
                            } else {
                                $('#wentwrong').modal("show");
                            }
                        }, function (reason) {
                            $scope.fbError = reason.data;
                            console.log(reason.data);
                        });
                });
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        });
    };
    //signup page
    $scope.signUp = function () {$location.path("/registration"); };
    //forget password page
    $scope.forgetPass = function () {$location.path("/resetpassword"); };
}]);
//registrationCtrl js
mainApp.controller("registrationCtrl", ["$scope", "$location", "$cookies", "$http", function ($scope, $location, $cookies, $http) {
    "use strict";
    //get category list
    $http({
        method: "POST",
        url: "http://yakensolution.cloudapp.net/Charity/Api/Category/GetAllCategories",
        data: null,
        headers: {'Content-Type': 'application/json'}
    })
        .then(function (response) {
            console.log(response.data);
            $scope.allcases = response.data.AllCategories;
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
                "CountryID": $scope.selectcountry
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
    //register
    $scope.registrar = function () {
        if ($scope.regpass === $scope.regpassConf) {
            
            var regdata = JSON.stringify({
                "Name": $scope.regname,
                "Login_Type": "1",
                "EMail": $scope.regemail,
                "Password" : $scope.regpass,
                "CityID": $scope.selectcity,
                "MobileNumber": $scope.mobnumber,
                "Gender": $scope.gender,
                "CategoryID": $scope.selectcat
            });
            console.log(regdata);
            $http({
                method: "POST",
                url: "http://yakensolution.cloudapp.net/Charity/Api/User/Regesteration",
                data: regdata,
                headers: {'Content-Type': 'application/json'}
            })
                .then(function (response) {
                    $scope.regReply = response.data;
                    console.log(response.data);
                    console.log($scope.regReply.IsSuccess);
                    console.log($scope.regReply.ErrorMessage);
                    if ($scope.regReply.IsSuccess) {
                        $('#vercode').modal("show");
                        //insert add picture api
                    } else {
                        $scope.errorMSG = response.data.ErrorMessage;
                        $('#regerror').modal("show");
                    }
                }, function (reason) {
                    $scope.errorMSG = reason.data.ErrorMessage;
                    console.log(reason.data);
                });
        }
    };
    $scope.verification = function () {
        console.log($scope.regReply.UserID);
        console.log($scope.verCode);
        var data = JSON.stringify({
            "User_ID" : $scope.regReply.UserID,
            "VerficationCode": $scope.verCode
        });
        $http({
            method: "POST",
            url: "http://yakensolution.cloudapp.net/Charity/Api/User/VerfiedAccnt",
            data: data,
            headers: {'Content-Type': 'application/json'}
        })
            .then(function (response) {
                $scope.verReply = response.data;
                console.log(response.data);
                if ($scope.verReply.IsSuccess) {
                    $('#vercode').modal("hide");
                    $cookies.putObject('accessID', $scope.regReply.UserID);
                    window.location.href = 'access.html';
                } else {
                    $('#vercode').modal("hide");
                    $scope.errorMSG = response.data.ErrorMessage;
                    $('#regerror').modal("show");
                }
            }, function (reason) {
                $scope.errorMSG = reason.data.ErrorMessage;
                console.log(reason.data);
            });
    };
}]);
//resetCtrl js
mainApp.controller("resetCtrl", ["$scope", "$location", "$cookies", "$http", function ($scope, $location, $cookies, $http) {
    "use strict";
    //forget pass send email
    $scope.forgetpass = function () {
        var data = JSON.stringify({
            "Email" : $scope.forgetpassemail
        });

        $http({
            method: "POST",
            url: "http://yakensolution.cloudapp.net/Charity/Api/User/ForgetPassword",
            data: data,
            headers: {'Content-Type': 'application/json'}
        })
            .then(function (response) {
                $scope.forgetreply = response.data;
                console.log(response.data);
                if ($scope.forgetreply.IsSuccess) {
                    $('#forgetpass').modal("show");
                } else {
                    $scope.errorMSG = $scope.forgetreply.ErrorMessage;
                    $('#forgetpasserror').modal("show");
                }
            }, function (reason) {
                $scope.forgetreply = reason.data;
                console.log(reason.data);
            });
    };
    //reset the new pass
    $scope.resetpass = function () {
        var data = JSON.stringify({
            "Email": $scope.repassemail,
            "Password": $scope.repasspass,
            "ConfirmPassword": $scope.repassrepass,
            "VerficationCode": $scope.repassconfcode
        });
        $http({
            method: "POST",
            url: "http://yakensolution.cloudapp.net/Charity/Api/User/ResetPassword",
            data: data,
            headers: {'Content-Type': 'application/json'}
        })
            .then(function (response) {
                $scope.resetreply = response.data;
                console.log(response.data);
                if ($scope.resetreply.IsSuccess) {
                    $('#forgetpass').modal("hide");
                    $(".modal-backdrop").remove();
                    $location.path("/");
                } else {
                    $scope.errorMSG = $scope.resetreply.ErrorMessage;
                    $('#forgetpasserror').modal("show");
                }
            }, function (reason) {
                $scope.resetreply = reason.data;
                console.log(reason.data);
            });
    };
}]);