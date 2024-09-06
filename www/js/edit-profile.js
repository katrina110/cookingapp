$(document).on('deviceready', function () {
    const user = JSON.parse(localStorage.getItem('user'));
    var profile = null;
    if (user) {
        // fetch user profile details
        window.FirebasePlugin.fetchDocumentInFirestoreCollection(
            user.uid,
            'profiles',
            function (document) {
                profile = document;
                $('#user-image').attr('src', profile.profilePic)
                $("#user-name").val(profile.name)
                $("#user-email").val(user.email)
                $("#user-location").val(profile.location)
                $("#user-bio").val(profile.bio ?? '')
            }
        )
    }

    $("#profile-form").on('submit', async function (e) {
        e.preventDefault();
        if (user) {
            $("button").attr('disabled', true).addClass('disabled')
            $("#submit-btn").html("Updating profile...")

            var userProfile = {
                name: $("#user-name").val(),
                location: $("#user-location").val(),
                bio: $("#user-bio").val(),
            }

            if ($('#add-image')[0].files.length > 0) {
                // upload image
                let userImage = await uploadImage($("#add-image")[0].files[0]);
                userProfile.profilePic = userImage;
            }
           
            // update profile
            window.FirebasePlugin.updateDocumentInFirestoreCollection(
                user.uid,
                userProfile,
                'profiles',
                true,
                function () {
                    $("button").removeAttr('disabled').removeClass('disabled')
                    $("#submit-btn").html("Update")

                    window.plugins.toast.showLongBottom('Successfully updated profile')
                },
                function (error) {
                    $("button").removeAttr('disabled').removeClass('disabled')
                    $("#submit-btn").html("Update")
                    console.error(error);
                }
            )
        }
    })

    $("#password-form").on('submit', function (e) {
        e.preventDefault();
        const submitBtn = $(this).find('button');
        submitBtn.attr('disabled', true).addClass('disabled').html('Changing password...')

        $(this).find('input').removeClass('error')
        $(this).find('.error-text').html('');

        const currentPassword = $("#current-password").val();
        const newPassword = $("#new-password").val();
        const confirmPassword = $("#confirm-password").val();

        if (newPassword != confirmPassword) {
            $("#new-password, #confirm-password").addClass('error')
            $("#new-password-error, #confirm-password-error").html('Passwords does not match')
            submitBtn.removeAttr('disabled').removeClass('disabled').html('Change password')
            return;
        }

        // try reauthenticate user with given password
        window. FirebasePlugin.signInUserWithEmailAndPassword(
            user.email,
            currentPassword,
            function(){
                window.FirebasePlugin.updateUserPassword(
                    confirmPassword,
                    function () {
                        $(this).find('input').removeClass('error')
                        $(this).find('.error-text').html('');
                        submitBtn.removeAttr('disabled').removeClass('disabled').html('Change password')
                        window.plugins.toast.showLongBottom('Successfully changed password')
                        $("#new-password, #confirm-password, #current-password").val('');
                    },
                    function (err) {
                        $(this).find('.error-text').html('');
                        submitBtn.removeAttr('disabled').removeClass('disabled').html('Change password')
                        console.error(err);
                        window.plugins.toast.showLongBottom('Something went wrong please try again later')
                    }
                )
            },
            function(err){
                console.error(err);
                $("#current-password").addClass('error')
                $("#current-password-error").html('Incorrect Password')
                submitBtn.removeAttr('disabled').removeClass('disabled').html('Change password')
            }
        )
    })
})