document.addEventListener('deviceready', function () {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    var user = null
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    const userId = params.get('user');

    window.FirebasePlugin.fetchDocumentInFirestoreCollection(userId, 'profiles', function (profile) {
        user = { ...profile, userId }
        console.log("Successfully fetched document: ", profile);
        $("#user-name").html(profile.name);
        $("#user-location").html(profile.location ?? '');
        $("#user-profile-picture").attr('src', profile.profilePic)
        $("#followers-count").html(profile.followers?.length ?? 0)
        if (profile.followers?.includes(currentUser.uid)) {
            $("#follow-btn").html('Following').addClass('following');
        }

    }, function (error) {
        console.error("Error fetching document: " + error);
    });

    $("#follow-btn").on('click', function (e) {
        if (user) {
            $("#follow-btn").html('...');
            if (user.followers?.includes(currentUser.uid)) {
                // remove from followers
                const followers = user.followers.filter((id) => id != currentUser.uid)
                window.FirebasePlugin.updateDocumentInFirestoreCollection(
                    user.userId,
                    {
                        followers
                    },
                    'profiles',
                    true,
                    function () {
                        $("#follow-btn").html('Follow').removeClass('following');
                        window.plugins.toast.showLongBottom("Unfollowed")
                        user.followers = followers;
                        $("#followers-count").html(followers.length)
                    },
                    function (error) {
                        console.error(error);
                    }
                )
            }
            else {
                const followers = user.followers ? [...user.followers, currentUser.uid] : [currentUser.uid]
                window.FirebasePlugin.updateDocumentInFirestoreCollection(
                    user.userId,
                    {
                        followers
                    },
                    'profiles',
                    true,
                    function () {
                        $("#followers-count").html(followers.length)
                        $("#follow-btn").html('Following').addClass('following');
                        window.plugins.toast.showLongBottom("Followed")
                    },
                    function (error) {
                        console.error(error);
                    }
                )
            }
        }
    })

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

}, false);
