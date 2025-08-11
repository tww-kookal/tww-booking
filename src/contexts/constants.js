import api from '../modules/apiClient';

let TOKEN_RECEIVED = false
let AUTH_TOKEN = ""
let AUTH_USER_OBJECT = ""
let AUTH_USER = ""

export const persistTokensReceived = (username, token) => {

    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    //Setting to Local Variables
    TOKEN_RECEIVED = true;
    AUTH_TOKEN = token;
    AUTH_USER = username;
    AUTH_USER_OBJECT = { username };

    //Setting to Local Storage
    // localStorage.setItem("access_token", token);
    // localStorage.setItem("user", JSON.stringify({ username }));

    //Setting to Session Storage
    // sessionStorage.setItem("access_token", token);
    // sessionStorage.setItem("user", JSON.stringify({ username }));

    console.log("persistTokensReceived::Tokens are persisted")
}

export const clearTokens = () => {
    TOKEN_RECEIVED = false;
    AUTH_TOKEN = "";
    AUTH_USER = "";
    AUTH_USER_OBJECT = "";
    api.defaults.headers.common["Authorization"] = "";
    console.log("clearTokens::Tokens are cleared")
}

export const isTokenReceived = () => {
    return TOKEN_RECEIVED;
}

export const getUserContext = () => {
    return { user: AUTH_USER, user_object: AUTH_USER_OBJECT, token: AUTH_TOKEN, isTokenReceived: TOKEN_RECEIVED }
}
