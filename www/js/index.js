document.addEventListener('deviceready', function () {
    if (window.FirebasePlugin) {
        console.log('firebase plugin: ', window.FirebasePlugin)
        window.FirebasePlugin.isUserSignedIn(function (isSignedIn) {
            if (isSignedIn) {
                if (localStorage.getItem('user') == null) {
                    window.FirebasePlugin.getCurrentUser(function (user) {
                        localStorage.setItem('user', JSON.stringify(user));
                    })
                }
            } else {
                localStorage.removeItem('user');
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
