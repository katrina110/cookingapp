$(document).on('deviceready', function () {
    // display user
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        window.FirebasePlugin.fetchDocumentInFirestoreCollection(
            user.uid,
            'profiles',
            function (profile) {
                $(".user-image").attr('src', profile.profilePic).show();
                $(".user-name").html(profile.name)
                $("#welcome-text").html(`Hello ${profile.name}, Welcome`)
            },
            function (err) {
                console.error(err);
                navigator
                    .notification
                    .alert(
                        'Error fetch user info!',
                        null,
                        'Error'
                    )
            }
        )

    }
    //fetch recipes
    var filters = [
        ['orderBy', 'created', 'desc'],
        ['limit',6]
    ];
    window.FirebasePlugin.fetchFirestoreCollection(
        'recipes',
        filters,
        function (recipes) {
            $("#latest-recipes").html('')
            for (let recipeId in recipes) {
                let recipe = recipes[recipeId];

                let item = ` <div class="col s6">
                                <a href="view-recipe.html?recipe=${recipeId}&from=index.html">
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
                            </div>`
                $("#latest-recipes").append(item)
            }

            if (Object.keys(recipes).length == 0) {
                $("#recipes-empty-text").show();
            }

        },
        function (error) {
            console.error(error)
            navigator
                .notification
                .alert(
                    'Error fetching recipes!',
                    null,
                    'Error'
                );
        }
    )

    // fetch saved recipes
    if (user) {
        window.FirebasePlugin.fetchFirestoreCollection(
            'savedRecipes',
            [['where', 'userId', '==', user.uid]],
            function (savedRecipes) {
                $("#saved-recipes").html('')
                for (let id in savedRecipes) {
                    let savedRecipe = savedRecipes[id];
                    window.FirebasePlugin.fetchDocumentInFirestoreCollection(
                        savedRecipe.recipeId,
                        'recipes',
                        function (recipe) {
                            let item = `<div class="swiper-slide">
                                            <a href="view-recipe.html?recipe=${savedRecipe.recipeId}">
                                                <div class="recipe-item">
                                                <div class="saved-symbol">
                                                    <ion-icon name="bookmark"></ion-icon>
                                                </div>
                                                <div class="image-mask"></div>
                                                <img src="${recipe.image}" alt="" />
                                                <div class="recipe-caption">
                                                    <ul class="recipe-statistic">
                                                    <li><ion-icon name="eye"></ion-icon>50K</li>
                                                    <li><ion-icon name="heart"></ion-icon>10K</li>
                                                    <li><ion-icon name="star"></ion-icon>4.5</li>
                                                    </ul>
                                                    <p class="recipe-title title-white">
                                                        ${recipe.title}
                                                    </p>
                                                </div>
                                                </div>
                                            </a>
                                        </div>`
                            $("#saved-recipes").append(item);
                        },
                        function (error) {
                            console.error(error);
                        }
                    )
                }
            },
            function (error) {
                console.error(error)
            }
        )
    }
});