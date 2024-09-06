document.addEventListener('deviceready', function () {
    if (window.FirebasePlugin) {
        console.log('firebase plugin: ', window.FirebasePlugin)
        window.FirebasePlugin.isUserSignedIn(function (isSignedIn) {
            if (isSignedIn) {
                $(".guest-components").css('display', 'none')
                $(".auth-components").css('display', 'block')
                if (localStorage.getItem('user') == null) {
                    window.FirebasePlugin.getCurrentUser(function (user) {
                        localStorage.setItem('user', JSON.stringify(user));
                    })
                }
            } else {
                localStorage.removeItem('user');
                $(".guest-components").css('display', 'block')
                $(".auth-components").css('display', 'none')
            }
        }, function (error) {
            console.error("Firebase error geting is user signed in: " + error);
        });
    } else {
        console.error("FirebasePlugin is not available");
    }

    window.FirebasePlugin.registerAuthStateChangeListener(function (isSignedIn) {
        if (isSignedIn) {
            if (localStorage.getItem('user') == null) {
                window.FirebasePlugin.getCurrentUser(function (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                })
            }
        } else {
            localStorage.removeItem('user');
        }
    });

}, false);


$(".image-input").on('change', function (e) {
    let imgPreview = $($(this).data('img-preview'));
    if (e.target.files.length > 0) {
        let file = e.target.files[0]
        imgPreview.attr('src', URL.createObjectURL(file));
    } else {
        imgPreview.attr('src', '');
    }
})

$(".image-input-label").on('click', function (e) {
    // console.log('clicked: ', )
    $(this).parent().find('input.image-input').trigger('click')
})
