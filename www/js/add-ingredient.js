$(document).on('deviceready', function () {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    const recipeId = params.get('recipe')
    var collection = "recipes";
    var recipe = null;
    $("button").attr('disabled', true).addClass('disabled')
    $("a").attr('disabled', true).addClass('disabled')
    // fetch recipe from db 
    window.FirebasePlugin.fetchDocumentInFirestoreCollection(
        recipeId,
        collection,
        function (document) {
            $("button").removeAttr('disabled').removeClass('disabled')
            $("a").removeAttr('disabled').removeClass('disabled')

            recipe = document;
        }
    )

    $("#add-ingredient-form").on("submit", function (e) {
        e.preventDefault();

        $("#submit-btn").attr('disabled', true).addClass('disabled').html('Saving...');
        $("button").attr('disabled', true).addClass('disabled')
        $("a").attr('disabled', true).addClass('disabled')

        const ingredient = $("#ingredient").val();
        window.FirebasePlugin.setDocumentInFirestoreCollection(
            recipeId,
            {
                ...recipe,
                ingredients: [
                    ...recipe.ingredients,
                    ingredient
                ]
            },
            'recipes',
            true,
            function () {
                window.location.href = "edit-recipe.html?recipe=" + recipeId + "#ingredients"
            },
            function (err) {
                console.error(err);
                $("#submit-btn").removeAttr('disabled').removeClass('disabled').html('Save');
                $("button").removeAttr('disabled').removeClass('disabled')
                $("a").removeAttr('disabled').removeClass('disabled')
                navigator
                .notification
                .alert(
                    'Something went wrong please try again later!',
                    null,
                    'Error'
                )
            }
        )
    })
})