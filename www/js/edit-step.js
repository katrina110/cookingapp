$(document).on("deviceready", function (e) {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    const recipeId = '';
    const instructionId = params.get('step');
    var collection = "recipes";
    var recipe = null;
    var instruction = null;

    $("button").attr('disabled', true).addClass('disabled')
    $("a").attr('disabled', true).addClass('disabled')
    // fetch recipe from db 
    window.FirebasePlugin.fetchDocumentInFirestoreCollection(
        instructionId,
        'instructions',
        function (document) {
            $("button").removeAttr('disabled').removeClass('disabled')
            $("a").removeAttr('disabled').removeClass('disabled')

            instruction = document;

            $("#title").val(instruction.title);
            $("#description").val(instruction.description);
            $("#image-preview").attr('src', instruction.image);
        }
    )

    $("#form").on('submit', async function (e) {
        e.preventDefault();
        if(!$('#image')[0].files || $('#image')[0].files.length == 0){
            window.plugins.toast.showLongBottom("Please select an image");
            return;
        }
        $("#submit-btn").attr('disabled', true).addClass('disabled').html('Saving...');
        $("button").attr('disabled', true).addClass('disabled')
        $("a").attr('disabled', true).addClass('disabled')

        // get values

        var recipeImage = instruction.image;
        if ($("#image")[0].files.length > 0) {
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
        }

        let newStep = {
            title: $("#title").val(),
            description: $("#description").val(),
            image: recipeImage,
        }
        window.FirebasePlugin.updateDocumentInFirestoreCollection(
            instructionId,
            newStep,
            'instructions',
            function () {
                window.location.href = `edit-recipe.html?recipe=${instruction.recipeId}#steps`
            },
            function (err) {
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