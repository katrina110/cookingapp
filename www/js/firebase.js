function signInWithEmailPassword(email, password) {
    window.FirebasePlugin.signInWithEmailAndPassword(email, password, function (user) {
        alert('Successfully logged in!');
        console.log("User signed in successfully:", user);
    }, function (error) {
        alert('Error logging in!');
        console.error("Error signing in:", error);
    });
}
