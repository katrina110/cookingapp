$(function () {
    function signInWithEmailPassword(email, password) {
        $("#submit-btn").html("Logging in...").attr('disabled', true).addClass('disabled')
        cordova.plugins.firebase.auth.signInWithEmailAndPassword(email, password)
            .then(function (res) {
                console.log('success')
                window.FirebasePlugin.getCurrentUser(function (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                    window.location.href = '/';
                    $("#submit-btn").removeAttr('disabled').removeClass('disabled').html("Log In")
                }, function (err) {
                    $("#submit-btn").removeAttr('disabled').removeClass('disabled').html("Log In")
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
                $("#submit-btn").removeAttr('disabled').removeClass('disabled').html("Log In")
                navigator.notification.alert(
                    'Invalid email and password please try again!',  // message
                    null,         // callback
                    'Failed',            // title
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
            $("#submit-btn").removeAttr('disabled').removeClass('disabled').html("Log In")
            navigator.notification.alert(
                'Error with code!',  // message
                alertDismissed,         // callback
                'Error',            // title
                'Okay'                  // buttonName
            );
        }

    })
})