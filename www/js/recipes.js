$(document).on('deviceready', function () {
    // display user
    const user = JSON.parse(localStorage.getItem('user'));

    //fetch recipes
    var filters = [
        ['orderBy', 'created', 'desc'],
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
});