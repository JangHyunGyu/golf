(() => {
    'use strict';

    const CURRENT_VERSION = '1.0.3';
    const UPDATE_CHECK_DELAY_MS = 3000;
    let registration = null;
    let reloadStarted = false;
    let updateNotice = null;

    function getCopy() {
        const language = (document.documentElement.lang || 'en').toLowerCase();
        if (language.startsWith('ko')) {
            return { message: '새 버전을 사용할 수 있습니다.', action: '업데이트' };
        }
        if (language.startsWith('ja')) {
            return { message: '新しいバージョンを利用できます。', action: '更新' };
        }
        return { message: 'A new version is available.', action: 'Update' };
    }

    function createUpdateNotice() {
        if (updateNotice) return updateNotice;

        const copy = getCopy();
        const notice = document.createElement('div');
        notice.id = 'app-update-notice';
        notice.setAttribute('role', 'status');
        notice.setAttribute('aria-live', 'polite');
        notice.style.cssText = [
            'position:fixed',
            'left:50%',
            'bottom:max(20px, env(safe-area-inset-bottom))',
            'transform:translateX(-50%)',
            'z-index:2147483647',
            'display:flex',
            'align-items:center',
            'gap:12px',
            'max-width:calc(100vw - 32px)',
            'padding:12px 14px',
            'border-radius:12px',
            'background:#17211b',
            'color:#fff',
            'box-shadow:0 10px 30px rgba(0,0,0,.28)',
            'font:600 14px/1.4 system-ui,sans-serif'
        ].join(';');

        const message = document.createElement('span');
        message.textContent = copy.message;

        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = copy.action;
        button.style.cssText = 'border:0;border-radius:8px;padding:8px 12px;background:#9ce8b3;color:#102116;font:700 14px system-ui,sans-serif;cursor:pointer';
        button.addEventListener('click', applyUpdate);

        notice.append(message, button);
        document.body.appendChild(notice);
        updateNotice = notice;
        return notice;
    }

    function showUpdateNotice() {
        if (document.body) {
            createUpdateNotice();
        } else {
            window.addEventListener('DOMContentLoaded', createUpdateNotice, { once: true });
        }
    }

    async function applyUpdate() {
        if (!registration) return;

        try {
            await registration.update();
        } catch (error) {
            console.info('Service worker update check failed.', error);
        }

        if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            return;
        }

        window.location.reload();
    }

    function watchInstallingWorker(worker) {
        if (!worker) return;
        worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateNotice();
            }
        });
    }

    async function checkPublishedVersion() {
        if (!registration) return;
        try {
            const response = await fetch(`version.json?t=${Date.now()}`, { cache: 'no-store' });
            if (!response.ok) return;
            const data = await response.json();
            if (data.version && data.version !== CURRENT_VERSION) {
                await registration.update();
                showUpdateNotice();
            }
        } catch (error) {
            console.info('Version check failed.', error);
        }
    }

    async function initializeUpdates() {
        if (!('serviceWorker' in navigator)) return;

        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (reloadStarted) return;
            reloadStarted = true;
            window.location.reload();
        });

        try {
            registration = await navigator.serviceWorker.register('service-worker.js');
            if (registration.waiting) showUpdateNotice();
            watchInstallingWorker(registration.installing);
            registration.addEventListener('updatefound', () => watchInstallingWorker(registration.installing));
            window.setTimeout(checkPublishedVersion, UPDATE_CHECK_DELAY_MS);
        } catch (error) {
            console.info('Service worker registration failed.', error);
        }
    }

    window.addEventListener('load', initializeUpdates, { once: true });
})();
