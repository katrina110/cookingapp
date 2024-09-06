$(document).on('deviceready', function (e) {
    const user = JSON.parse(localStorage.getItem('user'));
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
                            let item = `
                                        <a href="view-recipe.html?recipe=${savedRecipe.recipeId}">
                                            <div class="recipe-item">
                                                <div class="row">
                                                    <div class="col s3">
                                                        <div class="content">
                                                            <img src="${recipe.image}" alt="">
                                                        </div>
                                                    </div>
                                                    <div class="col s9">
                                                        <div class="content">
                                                            <div class="recipe-caption">
                                                                <ul class="recipe-statistic">
                                                                    <li><ion-icon name="eye"></ion-icon>50K</li>
                                                                    <li><ion-icon name="star"></ion-icon>4.5</li>
                                                                </ul>
                                                                <p class="recipe-title">${recipe.title}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="saved-symbol symbol-active">
                                                    <ion-icon name="bookmark"></ion-icon>
                                                </div>
                                            </div>
                                        </a>
                                    <div class="divider"></div>
                                    `
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
})