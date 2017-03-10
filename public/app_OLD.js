angular.module('helpDesk', ['ngResource', 'ui.router', 'datatables', 'ui.bootstrap', 'yaru22.angular-timeago','ngFileUpload'])
        .config(function ($stateProvider, $locationProvider, $urlRouterProvider) {
            $locationProvider.html5Mode(true);
            $urlRouterProvider.otherwise('dashboard/main');
            $stateProvider
                    .state('login', {
                        url: "/login",
                        templateUrl: '/partials/user/login',
                        authRequired: false
                    })
                    .state('forget-password', {
                        url: "/forget-password",
                        templateUrl: '/partials/user/forget-password',
                        authRequired: false,
                    })
                    .state('dashboard', {
                        url: "/dashboard",
                        abstract: true,
                        templateUrl: '/partials/main/dashboard-frame',
                        authRequired: true,
                        role: ['member', 'admin']
                    })
                    .state('dashboard.main', {
                        url: "/main",
                        templateUrl: '/partials/main/dashboard',
                        authRequired: true,
                        role: ['member', 'admin','approver']
                    })
                    .state('dashboard.team', {
                        url: "/team/members",
                        templateUrl: '/partials/team/members',
                        authRequired: true,
                        role: ['member', 'admin']
                    })
                    ///dashboard/team/member/
                    .state('dashboard.member-detail', {
                        url: "/team/member/:memberID",
                        templateUrl: '/partials/team/member-detail',
                        authRequired: true,
                        role: ['admin', 'member','approver']
                    })
                    .state('dashboard.member-profile', {
                        url: "/team/member-profile/:memberID",
                        templateUrl: '/partials/team/member-profile',
                        authRequired: true,
                        role: ['admin','member']
                    })
                    .state('dashboard.addmember', {
                        url: "/team/addmember",
                        templateUrl: '/partials/team/new-member',
                        authRequired: true,
                        role: ['admin']
                    })
                    .state('dashboard.tickets', {
                        url: "/tickets",
                        templateUrl: '/partials/tickets/tickets',
                        authRequired: true,
                        role: ['admin', 'member']
                    })
                    .state('dashboard.createnewticket', {
                        url: "/newticket",
                        templateUrl: '/partials/tickets/new-ticket',
                        authRequired: true,
                        role: ['admin', 'member']
                    })
                    .state('dashboard.ticket-details', {
                        url: "/tickets/ticket-detail/:ticketID",
                        templateUrl: '/partials/tickets/ticket-detail',
                        authRequired: true,
                        role: ['admin', 'member','approver']
                    })
                    .state("otherwise", {
                        url: '/otherwise',
                        templateUrl: '/utilities/error',
                        authRequired: false,
                        role: ['admin', 'any']
                    })

                    .state('dashboard.searchByDate', {
                        url: "/search-date",
                        templateUrl: '/partials/search/search-date',
                        authRequired: true,
                        role: ['member', 'admin']
                    })
                    .state('dashboard.approvals', {
                        url: "/my-approvals",
                        templateUrl: '/partials/ticketApprovals/ticketApproval',
                        authRequired: true,
                        role: ['member', 'admin', 'approver']
                    })

        })
        .run(function ($rootScope, $location, $window, AuthService, $state, $rootScope) {
            $rootScope.$on("$stateChangeStart", function (e, toState, toParams, fromState, fromParams) {
                //console.log(toState.name);
//                console.log(toState.role.indexOf($rootScope.userObj.accessRole));
//                console.log(toState.role);
//                console.log($rootScope.userObj.accessRole);
                if (toState.authRequired === true && AuthService.isAuthenticated() && toState.role.indexOf($rootScope.userObj.accessRole) !== -1) {
//                    if (toState.name === 'login' || toState.name === 'forget-password') {
//                        e.preventDefault();
//                        $state.go('dashboard.main');
//                        //console.log('user Authenticated');
//                    }
                } else if (toState.name === 'login' || toState.name === 'forget-password') {
                    if (AuthService.isAuthenticated()) {
                        //console.log('login or forget page now redirect to dashboard');
                        e.preventDefault();
                        $state.go('dashboard.main');
                    }
                } else if (toState.name !== 'login') {
                    // If logged in and transitioning to a logged out page:
                    //console.log('user not authenticated');
                    e.preventDefault();
                    $state.go('login');
                }
            });
        })
        .run(function ($rootScope) {
            if (!Notification) {
                alert('Desktop notifications not available in your browser. Try Chromium.');
                return;
            }
            //console.log(Notification.permission, "permission");
            if (Notification.permission !== "granted") {
                Notification.requestPermission();
            }
        })
        .controller('indexCtrl', ['$scope', '$state', 'AuthService', '$rootScope', '$location', function ($scope, $state, AuthService, $rootScope, $location) {
                //console.log($state.current.name);
                //console.log('triggered');
                $scope.isActive = function (viewLocation) {
                    return viewLocation === $state.current.name;
                    //return false;
                }
                $scope.logoutSubmit = function (condition) {
                    //console.log('logout submitted');
                    AuthService.logout();
                    //show message while updating password
                    if (condition === 'show_relogin_message') {
                        $rootScope.showreloginMsg = true;
                    }
                    $state.go('login');
                }


                $scope.NotificationSocket = function (ticket) {
                    var protocol = $location.protocol();
                    var host = $location.host();
                    var port = $location.port();
                    if (!Notification) {
                        alert('Desktop notifications not available in your browser. Try Chromium.');
                        return;
                    }
                    //console.log(Notification.permission, "permission");
                    if (Notification.permission !== "granted")
                        Notification.requestPermission();
                    else {
                        console.log('$scope.NotifictaionCustom is called');
                        console.log('Notifictaion is called');
                        var notification = new Notification(ticket.title, {
                            icon: 'https://s3-us-west-2.amazonaws.com/it-helpdesk-cgi/clogo.PNG',
                            body: 'New ticket raised by' + ' ' + ticket.empName,
                        });
                        var urlString = protocol + "://" + host + ":" + port + "/dashboard/tickets/ticket-detail/" + ticket.ticketID;
                        notification.onclick = function () {
                            window.open(urlString);
                        };
                    }
                }

                var socket = io.connect();
                socket.on('connect', function () {
                    console.log('connected for ticket notification');
                })
                socket.on('ticket', function (ticket) {
                    //console.log(ticket, 'realtime message');
                    $scope.NotificationSocket(ticket);
                    //$scope.ticketsList.push(ticket);
                    $rootScope.$broadcast('NewTicket', ticket);
                });


            }])
        .constant('AUTH_EVENTS', {
            notAuthenticated: 'auth-not-authenticated'
        })
        .constant('API_ENDPOINT', {
            //url: 'http://52.91.202.36:5000/api'
            url: 'http://localhost:5000/api'
        });