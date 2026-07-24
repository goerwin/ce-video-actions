(() => {
  if (window._ceVideoActionsDidRun) return;
  window._ceVideoActionsDidRun = true;

  const { hostname } = window.location;
  if (hostname === 'www.twitch.tv') return handleTwitch();
  if (hostname === 'www.youtube.com') return handleYoutube();
})();

function handleMaximizeShortcut(fn) {
  return (evt) => {
    if (!(evt.key === 'Escape' || (evt.altKey && evt.key === 't'))) return;
    evt.preventDefault();
    evt.stopPropagation();
    fn(evt);
  };
}

function createStyle(css) {
  const style = document.createElement('style');
  style.textContent = css;
  return style;
}

function handleTwitch() {
  const style = createStyle(`
    body.ce-custom-theater .persistent-player {
      width: 100% !important;
      z-index: 1000000 !important;
      height: calc(100vw * 9 / 16) !important;
    }
    body.ce-custom-theater .right-column {
      position: fixed !important;
      display: block !important;
      z-index: 9999999 !important;
      width: 100vw !important;
      height: auto !important;
      left: 0 !important;
      top: calc(100vw * 9 / 16) !important;
      bottom: 0;
    }
    body.ce-custom-theater .right-column > div[class*=Layout-sc]:first-child {
      display: block !important;
    }
    body.ce-custom-theater .right-column .channel-root__right-column {
      width: 100% !important;
    }
  `);

  document.addEventListener(
    'keydown',
    handleMaximizeShortcut(() => {
      const video = document.querySelector('.persistent-player');
      if (!video) return;

      const theaterBtn =
        document.querySelector(
          '[data-a-target="player-theatre-mode-button"]'
        ) || document.querySelector('.qa-theatre-mode-button');
      if (!theaterBtn) return;

      if (document.body.classList.contains('ce-custom-theater')) {
        document.body.classList.remove('ce-custom-theater');
        style.remove();
        theaterBtn.click();
        return;
      }

      if (video.classList.contains('persistent-player--theatre')) {
        document.body.classList.add('ce-custom-theater');
        document.head.appendChild(style);
        return;
      }

      theaterBtn.click();
    }),
    true
  );
}

function handleYoutube() {
  const cssInjectedClass = 'css-injected';
  let maximizeBtn = null;

  const style = createStyle(`
    html {
      overflow: hidden;
    }
    #items, #comments {
      visibility: hidden !important;
    }
    #player,
    #player-theater-container,
    #player-container-inner {
      z-index: 10000000 !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      bottom: 0 !important;
      right: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      min-height: auto !important;
      max-height: none !important;
      height: 100% !important;
      width: 100% !important;
    }
    .ytp-chrome-bottom {
      left: 12px !important;
      width: auto !important;
      right: 12px !important;
      position: fixed !important;
      bottom: 0 !important;
      margin: 0 !important;
    }
    .html5-video-player {
      z-index: 10000;
    }
    video.video-stream.html5-main-video {
      background-color: black !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      max-height: none !important;
      z-index: 10000 !important;
      object-fit: contain !important;
    }
  `);

  function toggleFullscreen(evt, { noFullscreen = false } = {}) {
    if (!maximizeBtn) return;

    const theaterBtn = document.querySelector('.ytp-size-button');
    const inTheater = !!document.querySelector('ytd-watch-flexy[theater]');
    const inFullscreen = maximizeBtn.classList.contains(cssInjectedClass);

    if (inTheater && !inFullscreen) {
      if (noFullscreen) {
        theaterBtn?.click();
      } else {
        maximizeBtn.classList.add(cssInjectedClass);
        document.head.appendChild(style);
      }
    } else if (inFullscreen) {
      maximizeBtn.classList.remove(cssInjectedClass);
      document.head.removeChild(style);
    } else {
      if (noFullscreen) {
        theaterBtn?.click();
      } else {
        maximizeBtn.classList.add(cssInjectedClass);
        document.head.appendChild(style);
      }
    }

    window.dispatchEvent(new Event('resize'));
    evt?.preventDefault();
  }

  function attachButton() {
    const original = document.querySelector(
      '.ytp-fullscreen-button.ytp-button, button[aria-label*="Full screen" i]'
    );
    if (!original || maximizeBtn) return;

    maximizeBtn = original.cloneNode(true);
    original.parentNode?.insertBefore(maximizeBtn, original.nextSibling);
    maximizeBtn.addEventListener('click', toggleFullscreen);
  }

  const observer = new MutationObserver(attachButton);
  observer.observe(document.body, { childList: true, subtree: true });
  attachButton();

  document.addEventListener(
    'keydown',
    handleMaximizeShortcut((evt) => {
      if (!maximizeBtn) attachButton();
      toggleFullscreen(undefined, { noFullscreen: evt.shiftKey });
    })
  );
}
