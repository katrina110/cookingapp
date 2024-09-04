$(function () {
    function signupUser(name, location, profilePic, email, password) {
        window.FirebasePlugin.createUserWithEmailAndPassword(email, password, function () {
            // successfully created user
            window.FirebasePlugin.getCurrentUser(function (user) {
                // store user details
                const documentId = user.uid;
                const document = {
                    name,
                    location,
                    profilePic,
                }
                window.FirebasePlugin.setDocumentInFirestoreCollection(documentId, document, "profiles", function () {
                    // successfully stored user info
                    window.FirebasePlugin.getCurrentUser(function (user) {
                        localStorage.setItem('user', JSON.stringify(user));
                        window.location.href = '/';
                    }, function (err) {
                        console.error(err)
                        navigator.notification.alert(
                            'Something went wrong please try again later!',  // message
                            null,         // callback
                            'Error',            // title
                            'Okay'                  // buttonName
                        );
                        $("#signup-btn").removeAttr('disabled')
                    })
                }, function (error) {
                    $("#signup-btn").removeAttr('disabled')
                    console.error(error)
                    // delete account
                    window.FirebasePlugin.deleteUser(function () {
                        navigator.notification.alert(
                            'Please try again later',  // message
                            null,         // callback
                            'Error creating account!',            // title
                            'Okay'                  // buttonName
                        );
                    })
                })
            }, function (err) {
                $("#signup-btn").removeAttr('disabled')
                console.error(err);
                navigator.notification.alert(
                    'Please try again later',  // message
                    null,         // callback
                    'Error getting account details!',            // title
                    'Okay'                  // buttonName
                );
            })
        }, function (err) {
            $("#signup-btn").removeAttr('disabled')
            console.error(err)
            navigator.notification.alert(
                'Please try again later',  // message
                null,         // callback
                'Failed to create account!',            // title
                'Okay'                  // buttonName
            );
        })
    }

    // on signup form submit
    $("#signup-form").on('submit', function (e) {
        e.preventDefault();
        $("#signup-btn").attr('disabled', true)

        const name = $("#name").val();
        const location = $("#location").val();
        const email = $("#email").val();
        const password = $("#password").val();
        const profilePic = 'profile_pics/profile-placeholder.jpg'

        signupUser(name, location, profilePic, email, password);
    })
})