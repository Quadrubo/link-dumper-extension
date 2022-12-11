// import { SHA256, Base64 } from "crypto-js";
var CryptoJS = require("crypto-js");
import axios from "axios";


window.onload = function() {
    document.getElementById('reset').addEventListener('click', function() {
        chrome.identity.clearAllCachedAuthTokens(function () {
            console.log("test");
        });
    });

    document.getElementById('login').addEventListener('click', getAccessToken);
}

function callback(redirectURL) {
    const urlParams = new URLSearchParams(new URL(redirectURL).search);

    const state = window.localStorage.getItem('state');
    const codeVerifier = window.localStorage.getItem('code_verifier');

    if (!(state.length > 0) || state !== urlParams.get('state')) {
        return;
    }

    let params = {
        grant_type: 'authorization_code',
        client_id: 9,
        redirect_uri: chrome.identity.getRedirectURL(),
        code_verifier: codeVerifier,
        code: urlParams.get('code'),
    }

    console.log(redirectURL);
    console.log(params);

    axios.post('http://localhost/oauth/token', params)
        .then(resp => {
            console.log(resp);
            
            localStorage.removeItem('state');
            localStorage.removeItem('verifier');

            const {token_type, expires_in, access_token, refresh_token} = resp.data;

            chrome.storage.local.set({
                "access_token": access_token,
                "token_type": token_type,
                "expires_in": expires_in,
                "refresh_token": refresh_token,
            });
        })
        .catch(e => {
            console.dir(e);
        });
}

function authorize() {
    const redirectURL = chrome.identity.getRedirectURL();
    const clientID = 9;
    
    const state = createRandomString(40); 
    window.localStorage.setItem('state', state);
    
    const verifier = createRandomString(128);
    window.localStorage.setItem('code_verifier', verifier);
    
    const challenge = base64Url(CryptoJS.SHA256(verifier));
    
    let authURL = "http://localhost/oauth/authorize";

    authURL += `?client_id=${clientID}`;
    authURL += `&redirect_uri=${encodeURIComponent(redirectURL)}`;
    authURL += `&response_type=code`;
    authURL += `&scope=`;
    authURL += `&state=${state}`;
    authURL += `&code_challenge=${challenge}`;
    authURL += `&code_challenge_method=S256`;

    return chrome.identity.launchWebAuthFlow({
        url: authURL,
        interactive: true    
    });
}

function getAccessToken() {
    return authorize().then(callback);
}

function createRandomString(num) {
    return [...Array(num)].map(() => Math.random().toString(36)[2]).join('')
}

function base64Url(string) {
    return string.toString(CryptoJS.enc.Base64)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}