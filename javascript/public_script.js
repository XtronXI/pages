/*
 * Copyright © 2020. Spectrollay
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


const currentURL = window.location.href;
const currentPagePath = window.location.pathname;
let hostPath = window.location.origin;
const parts = currentPagePath.split('/').filter(Boolean);
let rootPath = '/' + (parts.length > 0 ? parts[0] : '');
const slashCount = (currentPagePath.match(/\//g) || []).length;

window.logManager = {
    log: function (message, level = 'info') {
        const isLocalEnv = hostPath.includes('localhost') || rootPath.includes('_test');
        const formattedMessage = `[${level.toUpperCase()}]: ${message}`;
        const logFunction = console[level] || console.log;
        if (level === 'error') {
            logFunction.call(console, formattedMessage);
            console.trace();
        } else if (isLocalEnv) {
            logFunction.call(console, formattedMessage);
            console.trace();
        }
    }
};

// Night Mode Detection
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('no-dark-mode'); // Override dark mode with light mode styles
}

// Responsive Scroll View Animation
document.addEventListener('DOMContentLoaded', function () {
    const mainScrollView = document.querySelector('.main_scroll_view.with_sidebar');
    if (mainScrollView) {
        window.addEventListener('resize', function () {
            mainScrollView.classList.add('animate');
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.header_logo').addEventListener('click', scrollToTop);
});

let isNavigating = false;

function ifNavigating(way, url) {
    if (isNavigating) {
        return; // Prevent duplicate clicks
    }
    isNavigating = true; // Set to Redirecting
    if (way === 'direct') {
        setTimeout(() => {
            window.location.href = url;
        }, 100);
    } else if (way === 'open') {
        setTimeout(function () {
            window.open(url);
            setTimeout(function () {
                isNavigating = false; // Reset state, allow next click
            }, 100);
        }, 100);
    } else if (way === 'delayed_open') {
        setTimeout(function () {
            window.open(url);
            setTimeout(function () {
                isNavigating = false;
            }, 100);
        }, 1500);
    } else if (way === 'jump') {
        setTimeout(function () {
            window.location.href = url;
            setTimeout(function () {
                isNavigating = false;
            }, 100);
        }, 600);
    }
}

// --------Start of logManager----------

logManager.log("Browser User Agent: " + navigator.userAgent)
logManager.log("Current URL: " + currentURL);
logManager.log("Source: " + hostPath);
logManager.log("Root Path: " + rootPath);
logManager.log("Current Path: " + currentPagePath);
logManager.log("Currently on level " + (slashCount - 1) + " page");

if (hostPath.includes('file:///')) {
    logManager.log("Currently running in local file");
} else if (hostPath.includes('localhost')) {
    logManager.log("Currently running in local server");
} else {
    logManager.log("Currently running in " + hostPath);
    // Disable right-click menu
    document.addEventListener('contextmenu', function (event) {
        event.preventDefault();
    });
    // Disable long-press menu on mobile devices
    document.addEventListener('touchstart', function (event) {
        event.preventDefault();
    });
}
if (rootPath.includes('_test')) {
    document.body.classList.add('test');
    logManager.log("Currently in development environment");
} else {
    logManager.log("Currently in production environment");
}

// Global error handling
window.addEventListener('error', function (event) {
    logManager.log("Error: " + event.message, 'error');
});

document.addEventListener('DOMContentLoaded', function () {
    logManager.log("Page loaded successfully!");
});

const startTime = new Date().getTime();
window.addEventListener('load', function () {
    const endTime = new Date().getTime();
    let loadTime = endTime - startTime;
    logManager.log("Page load time: " + loadTime + "ms");
});
// --------End of logManager----------

// Audio Caching and Playback
const cacheName = 'audio-cache';
window.onload = async function () {
    if ('caches' in window) {
        try {
            const cache = await caches.open(cacheName);
            await cache.addAll([soundPaths['click'], soundPaths['button'], soundPaths['open'], soundPaths['close']]);
            logManager.log("Sound effect files cached!");
        } catch (error) {
            logManager.log("Sound effect files caching failed: " + error, 'error');
        }
    }
};

async function getCachedAudio(filePath) {
    if ('caches' in window) {
        try {
            const cache = await caches.open(cacheName);
            const response = await cache.match(filePath);
            if (response) {
                const blob = await response.blob();
                const audioURL = URL.createObjectURL(blob);
                logManager.log("Sound effect file retrieved from cache");
                return new Audio(audioURL); // Return audio from cache
            } else {
                logManager.log("Sound effect file not found in cache, attempting to load directly from link");
            }
        } catch (error) {
            logManager.log("Failed to retrieve sound effect file from cache: " + error, 'error');
        }
    } else {
        logManager.log("Browser does not support cache API, loading sound effect directly");
    }
    // If cache retrieval fails, load directly from the link
    return new Audio(filePath);
}

let userVolume = 1;

// Sound effect settings
const soundPaths = {
    click: './sounds/click.ogg',
    button: './sounds/button.ogg',
    pop: './sounds/pop.ogg',
    hide: './sounds/hide.ogg',
    open: './sounds/drawer_open.ogg',
    close: './sounds/drawer_close.ogg',
    toast: './sounds/toast.ogg'
};

function playSound(type) {
    const soundPath = soundPaths[type];
    if (!soundPath) {
        logManager.log(`Unknown sound effect type: ${type}`, 'error');
        return;
    }

    getCachedAudio(soundPath).then(audio => {
        audio.play().then(() => {
            logManager.log(`${type} sound effect played successfully!`);
        }).catch(error => {
            logManager.log(`${type} sound effect failed to play: ${error}`, 'error');
        });
    }).catch(error => {
        logManager.log(`Failed to get ${type} sound effect: ${error}`, 'error');
    });
}

// Button Sound Effects
function playSoundType(button) {
    if (button.classList.contains('normal_btn') || button.classList.contains('red_btn') || button.classList.contains('sidebar_btn') || (button.classList.contains('tab_bar_btn') && button.classList.contains('no_active')) || button.classList.contains('close_btn') || button.classList.contains('header_item')) {
        playSound('click');
    } else if (button.classList.contains('green_btn')) {
        playSound('button') ;
    }
}

function mainPage() {
    ifNavigating('jump', rootPath);
}

function clickedBack() {
    logManager.log("Click back button");
    playSound('click');
    setTimeout(function () {
        if (window.history.length <= 1) {
            logManager.log("Closing Window...");
            window.close();
        } else {
            logManager.log("Returning to previous page");
            window.history.back();
        }
    }, 600);
}

function openLink(url) {
    if (url.includes('xtronxi.github.io')) {
        ifNavigating('direct', 'about:blank');
    } else {
        ifNavigating('direct', url);
    }
}

function openLinkInNewTab(url) {
    if (url.includes('xtronxi.github.io')) {
        ifNavigating('open', 'about:blank');
    } else {
        ifNavigating('open', url);
    }
}

function delayedOpenLink(url) {
    ifNavigating('delayed_open', url);
}

function launchApplication(deeplink) {
    window.location.assign(deeplink);
}

function scrollToTop() {
    mainScrollContainer.scrollTo({
        top: 0, behavior: 'smooth'
    });
    console.log("Successfully executed scroll to top operation");
}

function toTop() {
    mainScrollContainer.scrollTo({
        top: 0, behavior: 'instant'
    });
}

function clickedMenu() {
    toggleSidebar();
    toggleOverlay();
}

function clickedOverlay() {
    toggleSidebar();
    toggleOverlay();
}

let sidebarOpen = false;

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebarOpen) {
        playSound('close');
        sidebar.style.left = -sidebar.offsetWidth + 'px'; // Hide to left
        logManager.log("Side panel executed collapse operation");
    } else {
        playSound('open');
        sidebar.style.left = '0'; // Show side panel
        logManager.log("Side panel executed expand operation");
    }
    sidebarOpen = !sidebarOpen;
    logManager.log("Successfully updated side panel status");
}

let overlayShow = false;

function toggleOverlay() {
    const overlay_main = document.getElementById('overlay_main');
    if (overlayShow) {
        overlay_main.style.display = 'none';
        logManager.log("Overlay successfully hidden");
    } else {
        overlay_main.style.display = 'block';
        logManager.log("Overlay successfully shown");
    }
    overlayShow = !overlayShow;
    logManager.log("Successfully updated overlay status");
}

