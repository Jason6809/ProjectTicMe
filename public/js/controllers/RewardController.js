app.controller('RewardController', ['$scope', '$firebaseObject', '$firebaseArray',
    function($scope, $firebaseObject, $firebaseArray) {
        const AUTH = firebase.auth();
        const DATABASE = firebase.database().ref();

        document.getElementById('SpinButton').disabled = true;

        var theWheel;

        $scope.PointsIsLoading = true;

        $scope.RewardsIsLoading = true;
        $scope.showTheWheel = false;

        $scope.wheelSpinning = false;



        //check auth
        $scope.auth = AUTH;
        $scope.auth.onAuthStateChanged(function(firebaseUser) {
            if (firebaseUser == null) {
                window.location.href = '/';
                console.log('$scope.auth.$onAuthStateChanged: signed out.');
            } else {
                //init
                $scope.currentUser = firebaseUser;



                // get basic user profile info
                const ProfileRef = DATABASE.child('Users').child($scope.currentUser.uid).child('Profile');
                ProfileRef.once('value').then(function(dataSnapshot) {
                    console.log('ProfileRef.once: dataSnapshot = ');
                    console.log(dataSnapshot.val());
                    $scope.Profile = dataSnapshot.val();
                });

                const PointsObj = new $firebaseObject(DATABASE.child('Users').child($scope.currentUser.uid).child('Points'));
                PointsObj.$loaded(function(res) {
                    $scope.PointsIsLoading = false;
                    console.log(PointsObj);



                    PointsObj.$bindTo($scope, 'Points').then(function() {
                        const ConfigRef = DATABASE.child('Config').child('Rewards').child('minRedeemablePoint');
                        ConfigRef.once('value').then(function(dataSnapshot) {
                            console.log('ConfigRef.once: dataSnapshot = ');
                            console.log(dataSnapshot.val());

                            $scope.minRedeemablePoint = dataSnapshot.val();

                            if ($scope.Points.received >= $scope.minRedeemablePoint) {
                                document.getElementById('SpinButton').disabled = false;
                            } else {
                                document.getElementById('SpinButton').disabled = true;
                            }

                        }, function(err) {
                            console.error('PointsObj.$loaded: ' + err);
                        });
                    });
                });

                PointsObj.$watch(function(res) {
                    $scope.PointsIsLoading = false;
                    console.log(PointsObj);

                    if (PointsObj.received >= $scope.minRedeemablePoint) {
                        document.getElementById('SpinButton').disabled = false;
                    } else {
                        document.getElementById('SpinButton').disabled = true;
                    }
                });

                console.log('$scope.auth.$onAuthStateChanged: signed in.');
            }
        });



        const RewardsRef = DATABASE.child('Rewards');
        var rewards = [];
        RewardsRef.once('value').then(function(dataSnapshot) {
            console.log('RewardsRef.once: dataSnapshot = ');
            console.log(dataSnapshot.val());

            dataSnapshot.forEach(function(childSnapshot) {
                if (childSnapshot.val().isVisible && childSnapshot.val().quantity > 0) {
                    console.log('RewardsRef.once: childSnapshot = ');
                    console.log(childSnapshot.val());

                    rewards.push(childSnapshot.val());
                }
                console.log('RewardsRef.once: rewards = ');
                console.log(rewards);
            });

            theWheel = new Winwheel({
                'numSegments': rewards.length, // Number of segments
                'outerRadius': 212, // The size of the wheel.
                'centerX': 217, // Used to position on the background correctly.
                'centerY': 217,
                'textFontSize': 12, // Font size.
                'segments': rewards, // Definition of all the segments.
                'animation': // Definition of the animation
                {
                    'type': 'spinToStop',
                    'duration': 5,
                    'spins': 8,
                    'callbackFinished': updateReceivedRewards
                }
            });

            document.getElementById('loader').style.display = 'none';
            document.getElementById('canvas').style.display = 'block';
        });
        // -------------------------------------------------------
        // Click handler for spin button.
        // -------------------------------------------------------
        $scope.startSpin = function() {
            // Ensure that spinning can't be clicked again while already running.
            if ($scope.wheelSpinning == false) {
                // Begin the spin animation by calling startAnimation on the wheel object.
                theWheel.startAnimation();
                // Set to true so that power can't be changed and spin button re-enabled during
                // the current animation. The user will have to reset before spinning again.
                $scope.wheelSpinning = true;
                document.getElementById('ResetButton').disabled = $scope.wheelSpinning;
            }
        };
        // -------------------------------------------------------
        // Function for reset button.
        // -------------------------------------------------------
        $scope.resetWheel = function() {
            theWheel.stopAnimation(false); // Stop the animation, false as param so does not call callback function.
            theWheel.rotationAngle = 0; // Re-set the wheel angle to 0 degrees.
            theWheel.draw(); // Call draw to render changes to the wheel.
            $scope.wheelSpinning = false; // Reset to false to power buttons and spin can be clicked again.
        };
        // -------------------------------------------------------
        // Called when the spin animation has finished by the callback feature of the wheel because I specified callback in the parameters
        // note the indicated segment is passed in as a parmeter as 99% of the time you will want to know this to inform the user of their prize.
        // -------------------------------------------------------
        function updateReceivedRewards(indicatedSegment) {
            const TAG = 'updateReceivedRewards: ';
            // Do basic alert of the segment text. You would probably want to do something more interesting with this information.
            // $scope.wheelSpinning = false;
            document.getElementById('ResetButton').disabled = false;
            console.log(TAG + ' indicatedSegment = ');
            console.log(indicatedSegment);

            if (indicatedSegment.quantity <= 0) {
                return alert('Sorry this reward finished please try again. ');
            }

            const receivedPointRef = DATABASE.child('Users').child($scope.currentUser.uid).child('Points');
            receivedPointRef.transaction(function(data) {
                console.log('receivedPointRef.transaction: data = ');
                console.log(data);
                if (data != null) {
                    data.received = data.received - $scope.minRedeemablePoint;
                }
                return data;
            }, function(err, comitted, snapshot) {
                if (err) {
                    console.error('receivedPointRef.transaction: err = ');
                    console.error(err);
                }
                console.log('receivedPointRef.transaction: snapshot = ');
                console.log(snapshot.val());
            }).then(function(res) {
                $scope.ReceivedRewards = $firebaseArray(DATABASE.child('Users').child($scope.currentUser.uid).child('ReceivedRewards'));
                $scope.ReceivedRewards.$add({
                    fillStyle: indicatedSegment.fillStyle,
                    isVisible: true,
                    quantity: 1,
                    text: indicatedSegment.text,
                    uid: indicatedSegment.uid,
                    datetime: new Date().getTime(),
                    status: false
                }).then(function(ref) {
                    alert("You have won " + indicatedSegment.text);
                    console.log(TAG + 'Success to add ' + indicatedSegment.text + ' to ReceivedRewards. ');

                    const rewardsRef = DATABASE.child('Rewards');
                    rewardsRef.transaction(function(data) {
                        console.log('rewardsRef.transaction: data = ');
                        console.log(data);
                        if (data != null) {
                            data[indicatedSegment.uid].quantity--;
                        }
                        return data;
                    }, function(err, committed, snapshot) {
                        if (err) {
                            console.error('rewardsRef.transaction: err = ');
                            console.error(err);
                        }
                        console.log('rewardsRef.transaction: snapshot = ');
                        console.log(snapshot.val());
                    });
                });
            });
        }
    }
]);