$(function () {
    var stepsCount = $(".step-group").length ?? 0;
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

    $("#add-ingredient").on('click', function (e) {
        $(`<input type="text" class="ingredient" placeholder="Ingredient ${$(".ingredient").length + 1}">`).appendTo("#ingredients")
    })

    $("#add-step").on('click', function (e) {
        stepsCount++;
        let step = `	<div data-step="${stepsCount}" class="step-group">
                            <div class="right-align">
								<button type="button" class="btn-remove-step btn-flat">
									<span>Remove Step</span>
								</button>
							</div>
							<input type="text" class="step-title" placeholder="Title">
							<textarea class="step-description" placeholder="Instruction"></textarea>
							<input class="step-image-input image-input" data-img-preview="#step-${stepsCount}-image-preview"
								type="file">
							<label class="image-input-label">
								<ion-icon name="camera-outline"></ion-icon>
							</label>
							<img src="" class="image-preview" id="step-${stepsCount}-image-preview" alt="">
						</div>`

        $('#steps').append('<div class="divider"></div>');
        $('#steps').append(step);

        $(".image-input-label").on('click', function (e) {
            // console.log('clicked: ', )
            $(this).parent().find('input.image-input').trigger('click')
        })

        $('.btn-remove-step').on('click', function (e) {
            $(this).parent().parent().prev('.divider').remove()
            $(this).parent().parent().remove()
        })
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

    // storing recipe to database
    $("#upload-recipe").on('click', async function (e) {
        const title = $("#recipe-title").val();
        const description = $("#recipe-description").val();
        const recipeImageInput = $("#recipe-image")[0];
        const ingredients = getIngredients();
        let steps = getSteps();
        let recipeImage = '';
        console.log(steps);

        if (title === '') {
            navigator.notification.alert(
                'Please enter a title!',  // message
                null,         // callback
                'Wait up',            // title
                'Okay'                  // buttonName
            );
            return;
        }
        else if (recipeImageInput.files.length == 0) {
            navigator.notification.alert(
                'Please upload an image for your recipe!',  // message
                null,         // callback
                'Wait up',            // title
                'Okay'                  // buttonName
            );
            return;
        } else if (ingredients.length == 0) {
            navigator.notification.alert(
                'Please add the ingredients for your recipe!',  // message
                null,         // callback
                'Wait up',            // title
                'Okay'                  // buttonName
            );
            return;
        }
        else if (steps.length == 0) {
            navigator.notification.alert(
                'Please add the steps for your recipe!',  // message
                null,         // callback
                'Wait up',            // title
                'Okay'                  // buttonName
            );
            return;
        }

        $(this).attr('disabled', true).addClass('disabled').html('Uploading recipe...')
        const user = JSON.parse(localStorage.getItem('user'));

        // upload the images first
        try {
            // upload recipe image
            recipeImage = await uploadImage(recipeImageInput.files[0]);

            // upload steps images
            for (let i = 0; i < steps.length; i++) {
                let imgUrl = await uploadImage(steps[i].image);
                steps[i] = { ...steps[i], image: imgUrl };
            }

        } catch (error) {
            console.error(error)
            return;
        }

        // if images are successfully uploaded store recipe to db
        // add recipe
        const recipeDoc = {
            title,
            description,
            image: recipeImage,
            userId: user.uid,
            ingredients,
        }
        window.FirebasePlugin.addDocumentToFirestoreCollection(recipeDoc, 'recipes', true, function (recipeId) {
            // successfully created recipe
            // add instructions/steps
            for (let step of steps) {
                let instructionDoc = {
                    recipeId,
                    ...step
                };
                window.FirebasePlugin.addDocumentToFirestoreCollection(instructionDoc, 'instructions', true, function () {

                }, function (err) {
                    console.error(err);
                    window.FirebasePlugin.deleteDocumentFromFirestoreCollection(recipeId, 'recipes', function () {
                        navigator.notification.alert(
                            'Sorry something went wrong please try again later!',  // message
                            null,         // callback
                            'Error',            // title
                            'Okay'                  // buttonName
                        );
                        return;
                    }, function (err) {
                        console.error(err);
                        navigator.notification.alert(
                            'Sorry something went wrong please try again later!',  // message
                            null,         // callback
                            'Error',            // title
                            'Okay'                  // buttonName
                        );
                        return;
                    });
                });
            }
            // successfully added instructions
            window.plugins.toast.showLongBottom("Successfully added recipe");
            window.location.href = "profile.html";
        })
    })
})