app.controller('IndexController', ['$scope', '$firebaseObject',
    function($scope, $firebaseObject) {
        const AUTH = firebase.auth();
        const DATABASE = firebase.database().ref();

        $scope.auth = AUTH;

        $scope.auth.onAuthStateChanged(function(firebaseUser) {
            if (firebaseUser != null) {
                $scope.isLogin = true;

                var userObject = new $firebaseObject(DATABASE.child('Users').child(firebaseUser.uid).child('Profile'));
                userObject.$bindTo($scope, 'Profile');

                console.log('$scope.auth.$onAuthStateChanged: signed in.');
            } else {
                $scope.isLogin = false;
                console.log('$scope.auth.$onAuthStateChanged: signed out.');
            }
        });

        $scope.signOut = function () {
            $scope.auth.signOut();
            window.location.href = '/';
        };
    }
]);