function uploadFileToFirebaseStorage(fileUri, storagePath) {
    const storageRef = firebase.storage().ref();
    const fileRef = storageRef.child(storagePath);

    window.resolveLocalFileSystemURL(fileUri, function (fileEntry) {
        fileEntry.file(function (file) {
            const reader = new FileReader();
            reader.onloadend = function (e) {
                const blob = new Blob([new Uint8Array(this.result)], { type: file.type });

                fileRef.put(blob).then(function (snapshot) {
                    console.log('Uploaded a blob or file!');
                }).catch(function (error) {
                    console.error('Upload failed:', error);
                });
            };
            reader.readAsArrayBuffer(file);
        });
    }, function (error) {
        console.error('Failed to resolve file URI:', error);
    });
}

// function fetchAndDisplayImage(storagePath, imgElementId) {
//     const storageRef = firebase.storage().ref();
//     const fileRef = storageRef.child(storagePath);

//     // Fetch the download URL for the image
//     fileRef.getDownloadURL()
//         .then(function(url) {
//             console.log('File available at:', url);

//             // Display the image in the img element
//             const imgElement = document.getElementById(imgElementId);
//             if (imgElement) {
//                 imgElement.src = url;
//             } else {
//                 console.error(`Image element with ID ${imgElementId} not found.`);
//             }
//         })
//         .catch(function(error) {
//             console.error('Failed to fetch image:', error);
//         });
// }
function fetchAndDisplayImage(storagePath = '', imgElementId) {
    const imgElement = document.getElementById(imgElementId);
    let path = storagePath.replace('/', '%2F')
    let url = `https://firebasestorage.googleapis.com/v0/b/iulam-b0aa7.appspot.com/o/${path}?alt=media&token=f54d8b60-f171-40e1-8379-8ffbad485ac3`
    if (imgElement) {
        imgElement.src = url;
    } else {
        console.error(`Image element with ID ${imgElementId} not found.`);
    }
}

// async function uploadImage(image) {
//     const apiKey = '6d207e02198a847aa98d0a2a901485a5';
//     const url = `https://freeimage.host/api/1/upload`;
//     let formatData = new FormData();

//     formatData.append('key', apiKey);
//     formatData.append('action', 'upload');
//     formatData.append('source', image);

//     try {
//         const response = await $.ajax({
//             method: 'POST',
//             url: url,
//             data: formatData,
//             processData: false,  // Prevent jQuery from automatically transforming the data into a query string
//             contentType: false,  // Prevent jQuery from overriding the Content-Type header
//             headers:{
//                 'Access-Control-Allow-Origin': '*'
//             }
//         });
//         console.log('upload res:', response);
//         return response.image.url;
//     } catch (err) {
//         console.error('Upload failed:', err);  // Log the error for debugging
//         throw err;
//     }
// }

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCbH3okFSTG-_xVAiHNJxnK7toqv_oSnGg",
    authDomain: "iulam-b0aa7.firebaseapp.com",
    projectId: "iulam-b0aa7",
    storageBucket: "iulam-b0aa7.appspot.com",
    messagingSenderId: "696693922011",
    appId: "1:696693922011:web:f86491b6d0c86a954954fe",
    measurementId: "G-80GFD2FZ7Y"
};

firebase.initializeApp(firebaseConfig);

// Reference to Firebase Storage
const storage = firebase.storage();
console.log('firebase: ', firebase)
console.log('storage: ', firebase)
async function uploadImage(imageFile) {
    const storageRef = storage.ref();
    const fileRef = storageRef.child('images/' + new Date().getTime() + '-' + imageFile.name);

    try {
        const snapshot = await fileRef.put(imageFile);
        console.log('Uploaded a blob or file!', snapshot);

        const downloadURL = await snapshot.ref.getDownloadURL();
        console.log('File available at', downloadURL);
        return downloadURL;
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
}
