// Use window.gapi instead of importing from gapi-script
import { FOLDER_ID } from '../config'

/**
 * Uploads a file to Google Drive.
 * @async
 * @param {File} file - The file to upload.
 * @param {string} bookingID - The booking ID associated with the file.
 * @returns {Promise<void>}
 */
export const uploadToDrive = async (file, bookingID) => {
    const metadata = {
        name: `${bookingID}_${file.name}`,
        mimeType: file.type,
        parents: FOLDER_ID ? [FOLDER_ID] : [],
    };

    const reader = new FileReader();
    const fileContent = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });

    const accessToken = window.gapi.auth.getToken().access_token;
    const form = new FormData(); 
    form.append(
        "metadata",
        new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    form.append("file", file);

    const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id", {
        method: "POST",
        headers: new Headers({ Authorization: "Bearer " + accessToken }),
        body: form,
    });

    const data = await res.json();
    console.log(`Uploaded File ID: ${data.id}`);
};
