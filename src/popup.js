'use strict';

import axios from 'axios';

(function () {
    async function getTabData() {
        return new Promise((resolve, reject) => {
            chrome.tabs.query(
                { active: true, lastFocusedWindow: true },
                (tabs) => {
                    resolve({
                        url: tabs[0].url,
                        title: tabs[0].title,
                    });
                }
            );
        });
    }

    function getTags() {
        const tags_output = document.getElementById('tags-output');

        let tags = [];

        Array.from(tags_output.children).forEach((child) => {
            tags.push(child.childNodes[0].textContent);
        });

        return tags;
    }

    function removeTag(e) {
        e.preventDefault();

        const parent = this.parentElement;

        parent.remove();
    }

    function saveTag(e) {
        e.preventDefault();

        const tags_input = document.getElementById('tags-input');
        const tag = tags_input.value;
        const tags_output = document.getElementById('tags-output');

        if (!tag) {
            return;
        }

        const tagButton = document.createElement('button');
        tagButton.classList.add(
            'tag',
            'inline-flex',
            'items-center',
            'justify-center',
            'min-h-6',
            'px-2',
            'py-0.5',
            'text-sm',
            'font-medium',
            'tracking-tight',
            'text-primary-700',
            'rounded-xl',
            'bg-primary-500/10',
            'space-x-1'
        );
        tags_output.appendChild(tagButton);

        const tagSpan = document.createElement('span');
        tagSpan.classList.add('text-start');
        tagSpan.innerHTML = tag;
        tagButton.appendChild(tagSpan);

        tagButton.innerHTML += `<svg class="w-3 h-3 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
      </svg>`;

        tagButton.addEventListener('click', removeTag);

        tags_input.value = '';
    }

    async function savePage(e) {
        e.preventDefault();

        let { url, title } = await getTabData();
        let tags = getTags();

        console.log(url, title, tags);

        const access_token = await readLocalStorage('access_token');
        const token_type = await readLocalStorage('token_type');

        axios
            .post(
                'http://localhost/api/links',
                {
                    url: url,
                    title: title,
                    tags: tags,
                },
                {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `${token_type} ${access_token}`,
                    },
                }
            )
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    async function setUserName() {
        let name;

        try {
            name = await getUserName();
        } catch (error) {
            document.getElementById(
                'header'
            ).innerHTML = `Please authenticate.`;
            return;
        }

        document.getElementById('header').innerHTML = `Hello, ${name}!`;
    }

    async function readLocalStorage(key) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get([key], function (result) {
                if (result[key] === undefined) {
                    reject();
                } else {
                    resolve(result[key]);
                }
            });
        });
    }

    async function getUserName() {
        let access_token = await readLocalStorage('access_token');
        let token_type = await readLocalStorage('token_type');

        return new Promise((resolve, reject) => {
            axios
                .get('http://localhost/api/user', {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `${token_type} ${access_token}`,
                    },
                })
                .then((response) => {
                    resolve(response.data.name);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    function openOptionsPage() {
        chrome.tabs.create({
            url: `chrome-extension://${chrome.runtime.id}/options.html`,
        });
    }

    document.addEventListener('DOMContentLoaded', setUserName);
    document
        .getElementById('options')
        .addEventListener('click', openOptionsPage);
    document.getElementById('save').addEventListener('click', savePage);
    document.getElementById('save-tag').addEventListener('click', saveTag);
    Array.from(document.getElementsByClassName('remove')).forEach(function (
        element
    ) {
        element.addEventListener('click', removeTag);
    });
})();
