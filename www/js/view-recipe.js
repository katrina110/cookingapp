function getTimeSince(timestampInSeconds) {
    if (timestampInSeconds < 0) {
        throw new Error("Timestamp cannot be negative.");
    }

    // Convert Firestore timestamp to milliseconds
    const timestampInMillis = timestampInSeconds * 1000;
    const now = Date.now(); // Current time in milliseconds

    // Calculate the difference
    const differenceInMillis = now - timestampInMillis;

    // Convert difference to seconds
    const differenceInSeconds = Math.floor(differenceInMillis / 1000);

    // Calculate days, hours, minutes, and seconds
    const days = Math.floor(differenceInSeconds / (24 * 3600));
    const hours = Math.floor((differenceInSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((differenceInSeconds % 3600) / 60);
    const seconds = differenceInSeconds % 60;

    // Build the result string

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
    return `A few moments ago`;
}


$(document).on('deviceready', function () {
    if(localStorage.getItem('user') == null){
        window.location.href = "login.html"
    }
    const user = JSON.parse(localStorage.getItem('user'));
    
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    const recipeId = params.get('recipe')
    var collection = "recipes";
    var recipe = null;
    var savedRecipeId = null;
    var owner = null;
    var reviews = null;

    $("#delete-recipe").on('click', function (e) {
        const deleteRecipe = () => {
            $("#delete-recipe").attr('disabled', true).addClass('disabled').html("Deleting Recipe")
            // delete recipe
            window.FirebasePlugin.deleteDocumentFromFirestoreCollection(
                recipeId,
                collection,
                function () {
                    window.plugins.toast.showLongBottom("Successfully deleted recipe");
                    history.back();
                },
                function (err) {
                    console.error(err);
                    navigator
                        .notification
                        .alert(
                            'Error deleting recipe please try again later',
                            null,
                            'Error'
                        );
                    $(this).removeAttr('disabled').removeClass('disabled').html("Delete Recipe")
                }
            )
        }

        navigator
            .notification
            .confirm(
                'This cannot be undone.',
                (choice) => {
                    if (choice == 1) {
                        deleteRecipe()
                    }
                },
                'Are you sure to delete this recipe?',
                [
                    'Delete',
                    'Cancel',
                ]
            )
    })


    window.FirebasePlugin.fetchDocumentInFirestoreCollection(
        recipeId,
        collection,
        function (document) {
            recipe = document;

            // fetch reviews
            window.FirebasePlugin.fetchFirestoreCollection(
                'reviews',
                [['where', 'recipeId', '==', recipeId]],
                function (collection) {
                    if (Object.keys(collection).length > 0) {
                        $("#reviews").html('')
                        reviews = collection
                    }
                    showTotalRating();
                    for (let reviewId in collection) {
                        let review = collection[reviewId];
                        if (review.userId == user.uid) {
                            $("#btn-rate").attr('disabled', true).find('.text').addClass('disabled').html("Rated")
                        }
                        window.FirebasePlugin.fetchDocumentInFirestoreCollection(
                            review.userId,
                            'profiles',
                            function (userProfile) {
                                let item = ` <div class="review-card">
                                                <img src="${userProfile.profilePic}" alt="">
                                                <div class="name-title">
                                                    <h6>${userProfile.name}</h6>
                                                    <p>${getTimeSince(review.created.seconds)}</p>
                                                </div>
                                                <ul class="rating-stars">
                                                    <li>(${review.rating})</li>
                                                    <li class="star ${review.rating >= 1 ? 'filled' : ''}"><ion-icon name="star"></ion-icon></li>
                                                    <li class="star ${review.rating >= 2 ? 'filled' : ''}"><ion-icon name="star"></ion-icon></li>
                                                    <li class="star ${review.rating >= 3 ? 'filled' : ''}"><ion-icon name="star"></ion-icon></li>
                                                    <li class="star ${review.rating >= 4 ? 'filled' : ''}"><ion-icon name="star"></ion-icon></li>
                                                    <li class="star ${review.rating >= 5 ? 'filled' : ''}"><ion-icon name="star"></ion-icon></li>
                                                </ul>
                                                <p>${review.comment}</p>
                                            </div>
                                            <div class="spacer-block spacer-sm"></div>`
                                $("#reviews").append(item)
                            },
                            function (err) {
                                console.error(err);
                            }
                        )
                    }

                },
                function (error) {
                    console.error(error);
                }
            )

            if (user && user.uid == recipe.userId) {
                $("#edit-recipe").attr('href', `edit-recipe.html?recipe=${recipeId}`).show()
                $("#delete-recipe").show()
            } else {
                window.FirebasePlugin.fetchDocumentInFirestoreCollection(
                    recipe.userId,
                    'profiles',
                    function (doc) {
                        owner = {
                            ...doc,
                            userId: recipe.userId
                        };
                        if (owner.followers?.includes(user.uid)) {
                            $("#follow-btn").html('Following').addClass('following');
                        }
                        $("#reaction-group").show();
                        $("#user-pic").attr('src', owner.profilePic)
                        $("#user-name").html(owner.name)
                        $("#view-user").attr('href', `view-profile.html?user=${recipe.userId}`)
                        $("#user-details").show()
                        $("#follow-btn").data('id', owner.uid)
                    }
                )

                window.FirebasePlugin.fetchFirestoreCollection(
                    'savedRecipes',
                    [
                        ['where', 'recipeId', '==', recipeId],
                        ['where', 'userId', '==', user.uid],
                    ],
                    function (collection) {
                        if (Object.keys(collection).length > 0) {
                            savedRecipeId = Object.keys(collection)[0];
                            $("#btn-save").data('status', 'saved').find('.text').html('Saved')
                        }
                    },
                    function (error) {
                        console.error(error)
                    }
                )
            }
            console.log('recipe: ', recipe)
            $("#recipe-image").attr('src', recipe.image)
            $("#recipe-title").html(recipe.title)
            $("#recipe-created-at").html(getTimeSince(recipe.created.seconds))
            $("#recipe-description").html(recipe.description)
            for (let ingredient of recipe.ingredients) {
                $("#ingredients").append(`<li>${ingredient}</li>`)
            }
            var filters = [
                ["where", "recipeId", "==", recipeId],
                ['orderBy', 'created', 'asc']
            ];
            window.FirebasePlugin.fetchFirestoreCollection(
                'instructions',
                filters,
                function (instructions) {
                    console.log('instructions: ', instructions)
                    let index = 1;
                    for (let instructionId in instructions) {
                        let instruction = instructions[instructionId];
                        let slide = ` <div class="swiper-slide">
                                            <div class="content">
                                                <img src="${instruction.image}" alt="">
                                                <h4 class="step-number">Step ${index++}: ${instruction.title}</h4>
                                                <p>${instruction.description}</p>
                                            </div>
                                        </div>`
                        $("#instructions").append(slide);
                    }
                },
                function (error) {
                    console.error(error);
                }
            )
        },
        function (error) {
            console.error("Error fetching document: " + error);
        }
    );

    $("#btn-save").on('click', function () {
        if (savedRecipeId) {
            window.FirebasePlugin.deleteDocumentFromFirestoreCollection(
                savedRecipeId,
                'savedRecipes',
                function (collection) {
                    $("#btn-save").data('status', 'unsave').find('.text').html('Save')
                    savedRecipeId = null;
                    window.plugins.toast.showShortCenter('Unsaved');
                },
                function (error) {
                    console.error(error)
                }
            )
        } else {
            window.FirebasePlugin.addDocumentToFirestoreCollection(
                {
                    recipeId,
                    userId: user.uid
                },
                'savedRecipes',
                true,
                function (documentId) {
                    savedRecipeId = documentId
                    $("#btn-save").data('status', 'saved').find('.text').html('Saved')
                    window.plugins.toast.showShortCenter('Saved');
                },
                function (err) {
                    console.error(err)
                }
            )
        }
    })

    $("#follow-btn").on('click', function (e) {
        if (owner) {
            $("#follow-btn").html('...');
            if (owner.followers?.includes(user.uid)) {
                // remove from followers
                const followers = owner.followers.filter((id) => id != user.uid)
                window.FirebasePlugin.updateDocumentInFirestoreCollection(
                    owner.userId,
                    {
                        followers
                    },
                    'profiles',
                    true,
                    function () {
                        $("#follow-btn").html('Follow').removeClass('following');
                        window.plugins.toast.showLongBottom("Unfollowed")
                        owner.followers = followers
                    },
                    function (error) {
                        console.error(error);
                    }
                )
            }
            else {
                const followers = owner.followers ? [...owner.followers, user.uid] : [user.uid]
                window.FirebasePlugin.updateDocumentInFirestoreCollection(
                    owner.userId,
                    {
                        followers
                    },
                    'profiles',
                    true,
                    function () {
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
    $("#btn-rate").on('click', function (e) {
        $("#rating-form-wrapper").show();
        $('html, body').scrollTop($("#rating-form").offset().top);
    })
    $("#rating-form").on('submit', function (e) {
        e.preventDefault()
        let rating = $('input[name="rating"]:checked').val();
        let comment = $("#comment").val();

        $("#rating-form").find('button').attr('disabled', true).addClass('disabled').html("Submitting...")
        window.FirebasePlugin.addDocumentToFirestoreCollection(
            {
                rating,
                comment,
                userId: user.uid,
                recipeId
            },
            'reviews',
            true,
            function (reviewId) {
                window.FirebasePlugin.fetchDocumentInFirestoreCollection(
                    user.uid,
                    'profiles',
                    function (profile) {
                        $("#rating-form").find('button').removeAttr('disabled').removeClass('disabled').html("Submit")
                        $("#rating-form-wrapper").hide();

                        let item = ` <div class="review-card">
                                            <img src="${profile.profilePic}" alt="">
                                            <div class="name-title">
                                                <h6>${profile.name}</h6>
                                                <p>A few moments ago</p>
                                            </div>
                                            <ul class="rating-stars">
                                                <li>(${rating})</li>
                                                <li class="star ${rating >= 1 ? 'filled' : ''}"><ion-icon name="star"></ion-icon></li>
                                                <li class="star ${rating >= 2 ? 'filled' : ''}"><ion-icon name="star"></ion-icon></li>
                                                <li class="star ${rating >= 3 ? 'filled' : ''}"><ion-icon name="star"></ion-icon></li>
                                                <li class="star ${rating >= 4 ? 'filled' : ''}"><ion-icon name="star"></ion-icon></li>
                                                <li class="star ${rating >= 5 ? 'filled' : ''}"><ion-icon name="star"></ion-icon></li>
                                            </ul>
                                            <p>${comment}</p>
                                        </div>
                                        <div class="spacer-block spacer-sm"></div>`
                        if (!reviews) {
                            $("#reviews").html('');
                        }
                        $("#reviews").append(item)

                        $("#btn-rate").attr('disabled', true).find('.text').addClass('disabled').html("Rated")

                        reviews = reviews ? {
                            ...reviews,
                            reviewId: {
                                rating,
                                comment,
                                userId: user.uid,
                                recipeId
                            }
                        } : {
                            reviewId: {
                                rating,
                                comment,
                                userId: user.uid,
                                recipeId
                            }
                        }

                        showTotalRating();


                    },
                    function (err) {
                        console.error(err);
                    }
                )

            },
            function (err) {
                console.error(err);
            }
        )
    })

    function showTotalRating() {
        if (reviews) {
            var totalRating = 0;

            for (let id in reviews) {
                totalRating += Number(reviews[id].rating);
            }
            // set total rating
            totalRating = (totalRating / Object.keys(reviews).length).toFixed(1) ?? 0

            if (totalRating && totalRating > 0) {
                $("#total-rating").html(`<li>(${totalRating})</li>
             <li class="star ${totalRating >= 1 ? 'filled' : ''}"><ion-icon name="star"></ion-icon></li>
              <li class="star ${totalRating >= 2 ? 'filled' : ''}"><ion-icon name="star"></ion-icon></li>
              <li class="star ${totalRating >= 3 ? 'filled' : ''}"><ion-icon name="star"></ion-icon></li>
              <li class="star ${totalRating >= 4 ? 'filled' : ''}"><ion-icon name="star"></ion-icon></li>
              <li class="star ${totalRating >= 5 ? 'filled' : ''}"><ion-icon name="star"></ion-icon></li>
                  `)
            } else {
                $("#total-rating").html("<p>Not rated</p>")
            }
        } else {
            $("#total-rating").html("<p>Not rated</p>")
        }
    }
})