document.addEventListener('deviceready', function () {
    window.FirebasePlugin.getCurrentUser(function (user) {
        if (!user) {
            window.location.href = "/login.html"
        } else {
            let userId = user.uid;
            window.FirebasePlugin.fetchDocumentInFirestoreCollection(userId, 'profiles', function (profile) {
                console.log("Successfully fetched document: ", profile);
                $("#user-name").html(profile.name);
                $("#followers-count").html(profile.followers ? profile.followers.length : 0);
                $("#user-location").html(profile.location ?? '');
                $("#user-profile-picture").attr('src', profile.profilePic)

            }, function (error) {
                console.error("Error fetching document: " + error);
            });

            // get recipes
            var collection = "recipes";
            var filters = [
                ["where", "userId", "==", userId],
            ];

            window.FirebasePlugin.fetchFirestoreCollection(
                collection,
                filters,
                function (recipes) {
                    console.log('recipes: ', recipes)
                    $("#recipe-count").html(Object.values(recipes).length)
                    $("#recipes-row").html('');
                    for (let recipeId in recipes) {
                        let recipe = recipes[recipeId];
                        let recipeItem = `<div class="col s6">
                                            <a href="view-recipe.html?recipe=${recipeId}">
                                                <div class="recipe-item">
                                                    <div class="saved-symbol">
                                                        <ion-icon name="bookmark"></ion-icon>
                                                    </div>
                                                    <img src="${recipe.image}" alt="" />
                                                    <div class="recipe-caption bg-gradient">
                                                        <ul class="recipe-statistic">
                                                            <li><ion-icon name="eye"></ion-icon>50K</li>
                                                            <li><ion-icon name="star"></ion-icon>4.5</li>
                                                        </ul>
                                                        <p class="recipe-title">${recipe.title}</p>
                                                    </div>
                                                </div>
                                            </a>
                                        </div>`;
                        $("#recipes-row").append(recipeItem)
                    }
                },
                function (error) {
                    console.error("Error fetching collection: " + error);
                }
            );
        }
    }, function (error) {
        console.error(error);
        window.location.href = "/login.html"
    })

    $("#logout-btn").on('click', function (e) {
        // sign out user
        navigator
            .notification
            .confirm(
                'Log out of your account?',
                (choice) => {
                    if (choice == 1) {
                        window.FirebasePlugin.signOutUser(
                            function () {
                                localStorage.removeItem('user');
                                window.location.href = "index.html";
                            },
                            function(err){
                                console.error(err)
                                window.plugins.toast.showLongBottom('Something went wrong please try again later!');
                            }
                        )
                    }
                },
                'Confirm',
                [
                    'Confirm',
                    'Cancel'
                ]
            )
    })

}, false);
