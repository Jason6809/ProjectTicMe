app.controller('MainController', ['$scope', '$location', '$firebaseArray',
    function($scope, $location, $firebaseArray) {
        const AUTH = firebase.auth();
        const DATABASE = firebase.database().ref();

        $scope.auth = AUTH;
        // $scope.users = $firebaseArray(DATABASE.child('Users'));

        $scope.auth.onAuthStateChanged(function(firebaseUser) {
            if (firebaseUser != null) {
                window.location.href = '#!/home';
                console.log('$scope.auth.$onAuthStateChanged: signed in.');
            } else {
                console.log('$scope.auth.$onAuthStateChanged: signed out.');
            }
        });

        $scope.registerFormVisible = false;
        $scope.loginFormVisible = true;

        $scope.showRegisterForm = function() {
            const TAG = 'showRegisterForm: ';
            $scope.registerFormVisible = true;
            $scope.loginFormVisible = false;

            console.log(TAG + '$scope.registerFormVisible=' + $scope.registerFormVisible);
            console.log(TAG + '$scope.loginFormVisible=' + $scope.loginFormVisible);
        };

        $scope.showLoginForm = function() {
            const TAG = 'showLoginForm: ';
            $scope.registerFormVisible = false;
            $scope.loginFormVisible = true;

            console.log(TAG + '$scope.registerFormVisible=' + $scope.registerFormVisible);
            console.log(TAG + '$scope.loginFormVisible=' + $scope.loginFormVisible);
        };

        $scope.login = function() {
            const TAG = 'login: ';
            // console.log(TAG + '$scope.email: ' + $scope.email + ' $scope.pwd: ' + $scope.pwd);
            $scope.auth.signInWithEmailAndPassword($scope.email, $scope.pwd).then(function(firebaseUser) {
                console.log(TAG + 'success. ');
            }).catch(function(err) {
                console.error(TAG + err);
                alert(err.message);
            });
        };

        $scope.register = function() {
            const TAG = 'register: ';
            // console.log(TAG + '$scope.email: ' + $scope.email + ' $scope.pwd: ' + $scope.pwd);
            if ($scope.pwd != $scope.cpwd) {
                console.warn(TAG + 'Password not match. ');
                return alert(TAG + 'Password not match. ');
            }

            $scope.auth.createUserWithEmailAndPassword($scope.email, $scope.pwd).then(function(userCredential) {
                console.log(TAG + 'success. ');

                const usersRef = DATABASE.child('Users').child(userCredential.user.uid);
                usersRef.set({
                    Points: {
                        current: 50,
                        gave: 0,
                        received: 0
                    },
                    Profile: {
                        displayName: $scope.displayName,
                        email: $scope.email,
                        username: $scope.username,
                        datetime: new Date().getTime(),
                        isVisible: true
                    },
                    ReceivedHashtags: {
                        teamplayer: { counter: 0, isVisible: true },
                        leader: { counter: 0, isVisible: true },
                        helpful: { counter: 0, isVisible: true },
                        collaborator: { counter: 0, isVisible: true },
                        contributor: { counter: 0, isVisible: true },
                        creativity: { counter: 0, isVisible: true },
                        customerservice: { counter: 0, isVisible: true },
                        efficient: { counter: 0, isVisible: true },
                        excellence: { counter: 0, isVisible: true },
                        fairness: { counter: 0, isVisible: true },
                        honesty: { counter: 0, isVisible: true },
                        initiative: { counter: 0, isVisible: true },
                        inspiring: { counter: 0, isVisible: true },
                        innovator: { counter: 0, isVisible: true },
                        knowledgeable: { counter: 0, isVisible: true },
                        listener: { counter: 0, isVisible: true },
                        motivator: { counter: 0, isVisible: true },
                        problemsolver: { counter: 0, isVisible: true },
                        productive: { counter: 0, isVisible: true },
                        reliable: { counter: 0, isVisible: true },
                        responsive: { counter: 0, isVisible: true },
                        responsible: { counter: 0, isVisible: true },
                        resourceful: { counter: 0, isVisible: true },
                        rolemodel: { counter: 0, isVisible: true },
                        thoughtful: { counter: 0, isVisible: true }
                    }
                }).then(function(ref) {
                    console.log('usersRef.set: success');

                    const usernameRef = DATABASE.child('Usernames').child($scope.username);
                    usernameRef.transaction(function(data) {
                        console.log('usernameRef.transaction: username = ' + $scope.username);
                        console.log('data = ');
                        console.log(data);

                        if (data == null) {
                            data = {
                                displayName: $scope.displayName,
                                user: userCredential.user.uid,
                                isVisible: true
                            };
                        }
                        return data;

                    }, function(error, committed, snapshot) {
                        if (error) {
                            console.error('usernameRef.transaction: username = @' + $scope.username + '; ' + ' Transaction failed abnormally!', error);
                        } else if (!committed) {
                            console.warn('usernameRef.transaction: username = @' + $scope.username + '; ' + ' Transaction is aborted.');
                        } else {
                            console.log('usernameRef.transaction: username = @' + $scope.username + '; ' + ' updated!');
                        }

                        console.log('usernameRef.transaction: username = @' + $scope.username);
                        console.log('snapshot = ');
                        console.log(snapshot.val());
                    });
                }, function(err) {
                    console.error(TAG + 'Error, failed to add new User to Users; ' + err);
                });

            }).catch(function(err) {
                console.error(TAG + 'Error, failed to register; ' + err);
                alert(err.message);
            });
        };
    }
]);