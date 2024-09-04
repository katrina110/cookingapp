$(function () {
    function signInWithEmailPassword(email, password) {
        cordova.plugins.firebase.auth.signInWithEmailAndPassword(email, password)
            .then(function (res) {
                // navigator.notification.alert(
                //     'Successfully logged in!',  // message
                //     alertDismissed,         // callback
                //     'Success',            // title
                //     'Okay'                  // buttonName
                // );
                console.log('success')
                window.FirebasePlugin.getCurrentUser(function(user){
                    localStorage.setItem('user',JSON.stringify(user));
                    window.location.href = '/';
                },function(err){
                    console.error(err)
                    navigator.notification.alert(
                        'Something went wrong please try again later!',  // message
                        null,         // callback
                        'Error',            // title
                        'Okay'                  // buttonName
                    );
                })
            })
            .catch(function (error) {
                navigator.notification.alert(
                    'Failed to log in!',  // message
                    null,         // callback
                    'Error',            // title
                    'Okay'                  // buttonName
                );
                console.error("Error signing in:", error);
            })
    }

    $("#login-form").on('submit', function (e) {
        e.preventDefault();
        const email = $("#email").val()
        const password = $("#password").val()
        // Use Firebase services
        try {
            signInWithEmailPassword(email, password);
        } catch (error) {
            navigator.notification.alert(
                'Error with code!',  // message
                alertDismissed,         // callback
                'Error',            // title
                'Okay'                  // buttonName
            );
        }

    })
})