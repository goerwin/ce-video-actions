(() => {
  if (window._ceVideoActionsDidRun) return;

  window._ceVideoActionsDidRun = true;

  const url = window.location.href;

  if (RegExp('https://www.twitch.tv/').test(url)) return handleTwitch();
  if (RegExp('https://www.youtube.com/').test(url)) return handleYoutube();
  if (RegExp('https://www.rojadirectatv.tv/').test(url)) return handleRDTV();
})();

function handleTwitch() {
  const head = document.head || document.getElementsByTagName('head')[0];
  const style = document.createElement('style');
  style.appendChild(
    document.createTextNode(`
      .persistent-player.persistent-player--fullscreen {
          width: 100% !important;
          z-index: 1000000 !important;
      }
    `)
  );
  head.appendChild(style);

  function toggleVideo() {
    const videoContainerEl =
      document.getElementsByClassName('persistent-player')[0];

    if (!videoContainerEl) return;

    const theatherModeBtn =
      document.querySelector('[data-a-target="player-theatre-mode-button"]') ||
      document.getElementsByClassName('qa-theatre-mode-button')[0];

    if (!theatherModeBtn) return;

    if (videoContainerEl.classList.contains('persistent-player--fullscreen')) {
      videoContainerEl.classList.remove('persistent-player--fullscreen');
      theatherModeBtn.click();
    } else if (
      videoContainerEl.classList.contains('persistent-player--theatre')
    ) {
      videoContainerEl.classList.add('persistent-player--fullscreen');
    } else {
      theatherModeBtn.click();
    }
  }

  // https://stackoverflow.com/a/13880739/1623282
  document.addEventListener(
    'keydown',
    function (evt) {
      evt = evt || window.event;
      const keyCode = evt.keyCode;
      if (keyCode === 27 || (evt.altKey && keyCode === 84)) {
        // esc or alt + t (F6)

        toggleVideo();
        evt.preventDefault();
        evt.stopPropagation();
      }
    },
    true
  );
}

function handleYoutube() {
  let g_newMaximizeBtn, g_interval;

  const css = `
  html {
      overflow: hidden;
  }

  #items,
  #comments {
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

  video.video-stream.html5-main-video {
      background-color: black !important;
      position: fixed !important;
      top: 0 !important;
      left: 0!important;
      width: 100% !important;
      height: 100% !important;
      max-height: none !important;
      z-index: 10000 !important;
  }`;

  const head = document.head || document.getElementsByTagName('head')[0];
  const style = document.createElement('style');
  const cssInjectedClassName = 'css-injected';
  style.appendChild(document.createTextNode(css));

  function handleToggleFullScreen(evt = null, options = {}) {
    if (!g_newMaximizeBtn) {
      return;
    }

    const toggleTheaterButton = document.querySelector('.ytp-size-button');
    const isInTheaterMode = !!document.querySelector(
      'ytd-watch-flexy[theater]'
    );
    const isInFullscreenMode =
      g_newMaximizeBtn.classList.contains(cssInjectedClassName);

    if (isInTheaterMode && !isInFullscreenMode) {
      if (options && options.noFullscreen) {
        toggleTheaterButton && toggleTheaterButton.click();
      } else {
        g_newMaximizeBtn.classList.add(cssInjectedClassName);
        head.appendChild(style);
      }
    } else if (isInFullscreenMode) {
      g_newMaximizeBtn.classList.remove(cssInjectedClassName);
      head.removeChild(style);
    } else {
      if (options && options.noFullscreen) {
        toggleTheaterButton && toggleTheaterButton.click();
      } else {
        g_newMaximizeBtn.classList.add(cssInjectedClassName);
        head.appendChild(style);
      }
    }

    window.dispatchEvent(new Event('resize'));
    evt && evt.preventDefault();
  }

  function appendNewMaximizeBtn() {
    const maximizeBtn = document.getElementsByClassName(
      'ytp-fullscreen-button ytp-button'
    )[0];

    if (!maximizeBtn) return;

    g_newMaximizeBtn = maximizeBtn.cloneNode(true);
    const controlsEl = document.getElementsByClassName('ytp-right-controls')[0];
    controlsEl.insertBefore(g_newMaximizeBtn, maximizeBtn);
    g_newMaximizeBtn.onclick = handleToggleFullScreen;
  }

  g_interval = window.setInterval(() => {
    if (g_newMaximizeBtn) return window.clearInterval(g_interval);
    appendNewMaximizeBtn();
  }, 1000);

  // https://stackoverflow.com/a/13880739/1623282
  document.addEventListener(
    'keydown',
    function (evt) {
      evt = evt || window.event;
      const keyCode = evt.keyCode;
      if (keyCode === 27 || (evt.altKey && keyCode === 84)) {
        // esc or alt + t (F6)
        !g_newMaximizeBtn && appendNewMaximizeBtn();
        handleToggleFullScreen(null, { noFullscreen: evt && evt.shiftKey });
      }
    },
    true
  );
}

function handleRDTV() {
  document.addEventListener('keydown', (evt) => {
    evt = evt || window.event;
    const keyCode = evt.keyCode;

    if (!(keyCode === 27 || (evt.altKey && keyCode === 84))) return;

    // esc or alt + t (F6)
    const cssStr = `
      #streamIframe#streamIframe {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        height: 100% !important;
        width: 100% !important;
        z-index: 99999999 !important;
        max-width: none !important;
        max-height: none !important;
      }`;

    const head = document.head || document.getElementsByTagName('head')[0];
    const currentStyleEl = document.getElementById('ce-video-actions-styletag');

    if (currentStyleEl) return currentStyleEl.remove();

    const style = document.createElement('style');
    style.appendChild(document.createTextNode(cssStr));
    style.setAttribute('id', 'ce-video-actions-styletag');
    head.appendChild(style);
  });
}
