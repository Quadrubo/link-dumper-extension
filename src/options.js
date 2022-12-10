import { SHA256, Base64 } from "crypto-js";

window.onload = function() {
    document.getElementById('reset').addEventListener('click', function() {
        chrome.identity.clearAllCachedAuthTokens(function () {
            console.log("test");
        });
    });

    document.getElementById('login').addEventListener('click', function() {
        const state = createRandomString(40); 
        const verifier = createRandomString(128);
        const challenge = base64Url(SHA256(verifier));

        const redirectURL = chrome.identity.getRedirectURL('redirect');

        console.log(redirectURL);

        chrome.identity.launchWebAuthFlow({
            url: "http://localhost/oauth/authorize?client_id=8&redirect_uri=" + redirectURL + "&response_type=code&scope=*&state=" + state + "&code_challenge=" + challenge + "&code_challenge_method=S256",
            interactive: true    
        }, function(redirectURL) {
            console.log(redirectURL);
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            } else {
                //
            }
        })
    });
}

function createRandomString(num) {
    return [...Array(num)].map(() => Math.random().toString(36)[2]).join('')
}

function base64Url(string) {
    return string.toString(Base64)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}