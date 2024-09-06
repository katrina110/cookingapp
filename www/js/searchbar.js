$(document).on('deviceready', function () {
    const user = JSON.stringify(localStorage.getItem('user'));
    var recentSearches = null;
    if (user) {
        // fetch recent searches
        window.FirebasePlugin.fetchFirestoreCollection(
            'recentSearches',
            [['where', 'userId', '==', user.uid]],
            function (documents) {
                recentSearches = documents;
                if(Object.keys(recentSearches).length > 0){
                    $("#recent-search-list").html('');
                }
                for (let id in recentSearches) {
                    let recentSearch = recentSearches[id];
                    let item = `<li data-keyword="${recentSearch.keyword}">
                                    <a href='view-recipe.html?recipe=${recentSearch.recipeId}'><ion-icon name="time-outline"></ion-icon> ${recentSearch.recipeTitle ?? 'Unknown'}</a>
                                </li>`
                    $("#recent-search-list").append(item)
                }
                $('.search-keyword').on('click', function (e) {
                    let keyword = $(this).data('keyword')
                    $("#search-input").val(keyword);
                    $("#search-form").trigger('submit')
                })
            }
        )

        if($('#search-input').val().length > 0){
            $("#recent-search").hide();
        }

        // $("#search-input").on('input',function(){
        //     if($(this).val() == ''){
        //         $("#recent-search").show();
        //     }else{
        //         $("#recent-search").hide();
        //     }
        // })

        $("#search-form").on('submit', function (e) {
            e.preventDefault();
            $("#recent-search").hide();
            $("#no-result-text").hide()
            $("#search-preloader").show();

            const keyword = $("#search-input").val();
            // fetch result
            var filters = [
                ['orderBy', 'created', 'desc'],
            ];
            window.FirebasePlugin.fetchFirestoreCollection(
                'recipes',
                filters,
                function (recipes) {
                    $("#search-preloader").hide();
                    var searchResult = []
                    for (let recipeId in recipes) {
                        if (recipes[recipeId].title.toLowerCase().includes(keyword.toLowerCase())) {
                            searchResult.push({
                                ...recipes[recipeId],
                                id: recipeId
                            })
                        }
                    }

                    if (searchResult.length == 0) {
                        $("#no-result-text").show()
                    }
                    for (let recipe of searchResult) {
                        let item = ` <div class="col s6">
                                        <a data-title="${recipe.title}" data-recipe="${recipe.id}" class='view-recipe' href="view-recipe.html?recipe=${recipe.id}&from=searchbar.html">
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
                        $("#search-result").append(item);
                    }

                    $(".view-recipe").on('click', function (e) {
                        e.preventDefault();
                        let url = $(this).attr('href');
                        let recipeId = $(this).data('recipe');
                        let recipeTitle = $(this).data('title');
                        let doc = {
                            recipeId,
                            recipeTitle,
                            userId: user.uid ?? 'unknown',
                        }
                        if (user) {
                            window.FirebasePlugin.addDocumentToFirestoreCollection(
                                doc,
                                'recentSearches',
                                true,
                                function () {
                                    window.location.href = url;
                                },
                                function (err) {
                                    console.error(err);
                                }
                            )
                        }
                    })
                },
                function (error) {
                    console.error(error)
                }
            )
        })
    } else {
        window.location.href = "login.html";
    }
})