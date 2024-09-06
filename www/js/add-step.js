$(document).on("deviceready", function (e) {
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

    $("#form").on('submit', async function (e) {
        e.preventDefault();

        $("#submit-btn").attr('disabled', true).addClass('disabled').html('Saving...');
        $("button").attr('disabled', true).addClass('disabled')
        $("a").attr('disabled', true).addClass('disabled')
        var recipeImage = '';
        try {
            // upload recipe image
            recipeImage = await uploadImage($('#image')[0].files[0]);

            // upload steps images
            for (let i = 0; i < steps.length; i++) {
                let imgUrl = await uploadImage(steps[i].image);
                steps[i] = { ...steps[i], image: imgUrl };
            }

        } catch (error) {
            console.error(error)
            return;
        }

        let newStep = {
            title: $("#title").val(),
            description: $("#description").val(),
            image:recipeImage,
        }
        window.FirebasePlugin.addDocumentToFirestoreCollection(
            newStep,
            'instructions',
            true,
            function(){
                window.location.href = `edit-recipe.html?recipe=${recipeId}#steps`
            },
            function(err){
                console.error(err);
                navigator
                .notification
                .alert(
                    'Something went wrong please try again later!',
                    null,
                    'Error'
                )
                $("#submit-btn").removeAttr('disabled').removeClass('disabled').html('Save');
                $("button").removeAttr('disabled').removeClass('disabled')
                $("a").removeAttr('disabled').removeClass('disabled')
            }
        )
    })

})

$(function () {
    $(".image-input").on('change', function (e) {
        let imgPreview = $($(this).data('img-preview'));
        if (e.target.files.length > 0) {
            let file = e.target.files[0]
            imgPreview.attr('src', URL.createObjectURL(file));
        } else {
            imgPreview.attr('src', '');
        }
    })

    $(".image-input-label").on('click', function (e) {
        // console.log('clicked: ', )
        $(this).parent().find('input.image-input').trigger('click')
    })
})