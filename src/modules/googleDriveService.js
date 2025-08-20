// Use window.gapi instead of importing from gapi-script

import { GOOGLE_APP_CLIENT_ID, API_KEY, SCOPES, DISCOVERY_DOCS } from './config';

let tokenClient;
let isAuthenticated = false;

/**
 * Initializes the Google API client
 */
export const initGapiClient = () => {
    return new Promise((resolve, reject) => {
        if (!window.gapi) {
            reject(new Error("gapi not loaded"));
            return;
        }

        window.gapi.load("client", async () => {
            try {
                await window.gapi.client.init({
                    apiKey: API_KEY,
                    discoveryDocs: DISCOVERY_DOCS,
                });
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    });
};

/**
 * Ensures authentication happens once and token is reused
 */
const authenticate = () => {
    return new Promise((resolve, reject) => {
        if (isAuthenticated && window?.gapi?.client?.getToken()) {
            resolve(); // already authenticated
            return;
        }

        try {
            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_APP_CLIENT_ID,
                scope: SCOPES,
                callback: (tokenResponse) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        isAuthenticated = true;
                        resolve();
                    } else {
                        reject(new Error("Failed to authenticate with Google"));
                    }
                },
            });

            tokenClient.requestAccessToken();
        } catch (err) {
            reject(err);
        }
    });
};

async function listFilesRecursively(folderId) {
    const results = [];

    // Fetch files/folders inside the given folder
    const response = await window.gapi.client.drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: "files(id, name, mimeType, webViewLink)"
    });

    const files = response.result.files;

    for (let file of files) {
        if (file.mimeType === "application/vnd.google-apps.folder") {
            // If it's a folder, recurse into it
            const children = await listFilesRecursively(file.id);
            results.push({
                ...file,
                children
            });
        } else {
            // If it's a file, just push
            results.push(file);
        }
    }

    return results;
}

/**
 * Fetch files from a folder (requires auth)
 * @param {string} folderId - Google Drive Folder ID
 */
const fetchFilesInFolder = async (folderId) => {
    return new Promise((resolve, reject) => {
        authenticate().then(() => {
            // Fetch files/folders inside the given folder
            window.gapi.client.drive.files.list({
                q: `'${folderId}' in parents and trashed=false`,
                fields: "files(id, name, mimeType, webViewLink)"
            }).then((response) => {
                resolve(response.result.files || []);
            }).catch((err) => {
                console.log("fetchFilesInFolder::Error authenticating with Google1 ", err);
                reject(err);
            });
        }).catch((err) => {
            console.log("fetchFilesInFolder::Error authenticating with Google2 ", err);
            reject(err);
        });
    }).catch((err) => {
        console.log("fetchFilesInFolder::Error authenticating with Google3 ", err);
        reject(err);
    })
};

/**
 * Loads bookings and attaches fetched files (auth only once)
 */
export const loadBookingsWithAttachments = async (bookings) => {
    await authenticate(); // authenticate only once here

    const fetchedFiles = await fetchFilesInFolder(FOLDER_ID);

    for (let booking of bookings) {
        booking.attachments = fetchedFiles.filter(file => file.name.includes(booking.booking_id));
    }

    return bookings;
};

const getFilesInBookingFolder = async (fetchedFiles, booking_id) => {
    let filesInBookingFolder = []
    for (let file of fetchedFiles) {
        if (file.mimeType === "application/vnd.google-apps.folder" && file.name == booking_id) {
            // If it's a folder, recurse into it
            filesInBookingFolder = await fetchFilesInFolder(file.id);
        }
    }
    return filesInBookingFolder
}