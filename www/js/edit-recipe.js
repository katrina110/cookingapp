$(document).on('deviceready', function () {
    $('.modal').modal({
        dismissible: false,
    });
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);

    const recipeId = params.get('recipe')
    var recipe = null;
    var collection = "recipes";

    // fetch recipe info
    $("a").attr('disabled', true).addClass('disabled');
    $("button").attr('disabled', true).addClass('disabled');
    window.FirebasePlugin.fetchDocumentInFirestoreCollection(
        recipeId,
        'recipes',
        function (document) {
            recipe = { ...document };

            $("#add-ingredient").attr('href', `add-ingredient.html?recipe=${recipeId}`);
            $("#add-step").attr('href', `add-step.html?recipe=${recipeId}`);

            $("a").removeAttr('disabled').removeClass('disabled');
            $("button").removeAttr('disabled').removeClass('disabled');

            // display details
            $("#recipe-image-preview").attr('src', recipe.image)
            $("#recipe-title").val(recipe.title)
            $("#recipe-description").val(recipe.description)
            $("#ingredients").html('')
            let ingredientIndex = 0;
            for (let ingredient of recipe.ingredients) {
                let item = `<div class="ingredient-group">
                            <input readonly type="text" class="ingredient" placeholder="Ingredient" value="${ingredient}">
                            <button data-index="${ingredientIndex}" class="delete-ingredient-btn action" type="button">
                                <ion-icon name="trash"></ion-icon>
                            </button>
                            <a href="edit-ingredient.html?recipe=${recipeId}&index=${ingredientIndex}" class=" action edit-ingredient-btn">
                                <ion-icon name="pencil"></ion-icon>
                            </a>
                        </div>`
                $("#ingredients").append(item)
                ingredientIndex++;
            }

            // fetch instruction
            var filters = [
                ["where", "recipeId", "==", recipeId],
                ['orderBy', 'created', 'asc']
            ];
            window.FirebasePlugin.fetchFirestoreCollection(
                'instructions',
                filters,
                function (instructions) {
                    $("#steps").html('');
                    for (let instructionId in instructions) {
                        let instruction = instructions[instructionId];
                        let item = `<div class="step-group">
                                        <input type="text" readonly value="${instruction.title}" class="step-title" placeholder="Title">
                                        <textarea readonly class="step-description" placeholder="Instruction">${instruction.description}</textarea>
                                        <img src="${instruction.image}" class="image-preview" id="step-1-image-preview" alt="">
                                        <br>
                                        <a href="edit-step.html?step=${instructionId}" class="button secondary">Edit Step</a>
                                    </div>`
                        $("#steps").append(item)
                    }
                },
                function (error) {
                    console.error(error);
                }
            )

            $(".delete-ingredient-btn").on('click', function () {
                navigator
                .notification
                .confirm(
                    'Deleting this cannot be undone',
                    (choice) => {
                        if(choice == 1){
                            deleteIngredient()
                        }
                    },
                    'Are you sure?',
                    [
                        'Delete',
                        'Cancel'
                    ]
                )

                const deleteIngredient = () => {
                    $("a").attr('disabled', true).addClass('disabled');
                    $("button").attr('disabled', true).addClass('disabled');
                    const index = $(this).data('index');
                    let newIngredients = recipe.ingredients.filter((item, i) => i !== index);
                    window.FirebasePlugin.updateDocumentInFirestoreCollection(
                        recipeId,
                        {
                            ingredients: newIngredients
                        },
                        'recipes',
                        true,
                        function () {
                            recipe = { ...recipe, ingredients: newIngredients };
                            $("button").removeAttr('disabled').removeClass('disabled');
                            $("a").removeAttr('disabled').removeClass('disabled');
                            $($('.ingredient-group')[index]).remove();
                        },
                        function (err) {
                            console.error(err);
                        }
                    )
                }
            })
        },
        function (error) {
            $("a").removeAttr('disabled').removeClass('disabled');
            $("button").removeAttr('disabled').removeClass('disabled');
            navigator
                .notification
                .alert(
                    'Error getting recipe details!',
                    null,
                    'Error'
                )
            console.error(error);
        }
    )

    console.log('user: ', localStorage.getItem('user'))
    var stepsCount = $(".step-group").length;
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



    function getSteps() {
        let steps = [];
        $.each($('.step-group'), function (i, step) {
            console.log('step: ', step)
            let title = $($(step).find('.step-title')[0]).val()
            let description = $($(step).find('.step-description')[0]).val()
            let imageInput = $(step).find('.step-image-input')[0];
            console.log('step image input: ', imageInput)

            let image = imageInput.files.length > 0 ? imageInput.files[0] : '';

            if (title != '' && description != '' && image != '') {
                steps.push({
                    title,
                    description,
                    image
                });
            }
        })

        return steps;
    }

    function getIngredients() {
        let ingredients = []

        $.each($('.ingredient'), function (i, elem) {
            if ($(elem).val() != '') {
                ingredients.push($(elem).val())
            }
        })

        return ingredients;
    }

    // update recipe title, image and description
    $("#edit-recipe-form").on('submit', async function (e) {
        e.preventDefault();
        const title = $("#recipe-title").val();
        const description = $("#recipe-description").val();
        const recipeImageInput = $("#recipe-image")[0];

        let recipeImage = recipe.image;

        if (recipeImageInput.files.length > 0) {
            // upload image
            try {
                // upload recipe image
                recipeImage = await uploadImage(recipeImageInput.files[0]);

            } catch (error) {
                console.error(error)
                return;
            }
        }

        $('#submit-btn').attr('disabled', true).addClass('disabled').html('Saving changes...')
        // if images are successfully uploaded store recipe to db
        const newRecipeDoc = {
            title,
            description,
            image: recipeImage,
        }
        window.FirebasePlugin.updateDocumentInFirestoreCollection(
            recipeId,
            newRecipeDoc,
            'recipes',
            true,
            function () {
                window.plugins.toast.showLongBottom("Successfully saved changes");
                $('#submit-btn').removeAttr('disabled').removeClass('disabled').html('Save changes')
                // navigator
                //     .notification
                //     .alert(
                //         'Successfully save changes!',
                //         () => {
                //             window.location.reload()
                //         },
                //         'Success'
                //     )
            },
            function (error) {
                console.error(error);
            }
        )
    })
})