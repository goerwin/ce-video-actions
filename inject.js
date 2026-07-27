(() => {
	if (window._ceVideoActionsDidRun) return;
	window._ceVideoActionsDidRun = true;

	const { hostname } = window.location;
	if (hostname === "www.youtube.com") return handleYoutube();
})();

function handleMaximizeShortcut(fn) {
	return (evt) => {
		if (!(evt.key === "Escape" || (evt.altKey && evt.key === "t"))) return;
		evt.preventDefault();
		evt.stopPropagation();
		fn(evt);
	};
}

function createStyle(css) {
	const element = document.createElement("style");
	element.textContent = css;
	return element;
}

function handleYoutube() {
	let maximizeBtn = null;

	const style = createStyle(`
    html {
      overflow: hidden;
    }

    #items,
    #comments,
    #related,
    .ytp-overlays-container,
    #below,
    #secondary {
      visibility: hidden !important;
    }

    #player,
    #player-theater-container,
    #player-container-inner,
    #page-manager {
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

	function toggleFullscreen(_evt, { noFullscreen = false } = {}) {
		if (!maximizeBtn) return;

		const theaterBtn = document.querySelector(".ytp-size-button");
		const inFullscreen = document.head.contains(style);
    const inTheaterMode = !!document.querySelector('ytd-watch-flexy[theater]');

		if (noFullscreen) {
			return void theaterBtn?.click();
		}

		if (inFullscreen) {
			document.head.removeChild(style);
			return void window.dispatchEvent(new Event("resize"));
		}

    document.head.append(style);

    //
    // Don't resize on theater mode as the track is already in good size.
    // We have to trigger a resize in non theater mode (small) so that
    // the track is updated
    //
    if (!inTheaterMode) {
      window.dispatchEvent(new Event("resize"));
    }
	}

	function attachButton() {
		const original = document.querySelector(
			'.ytp-fullscreen-button.ytp-button, button[aria-label*="Full screen" i]',
		);
		if (!original || maximizeBtn) return;

		maximizeBtn = original.cloneNode(true);
		original.parentNode?.insertBefore(maximizeBtn, original.nextSibling);
		maximizeBtn.addEventListener("click", toggleFullscreen);
	}

	const observer = new MutationObserver(attachButton);
	observer.observe(document.body, { childList: true, subtree: true });
	attachButton();

	document.addEventListener(
		"keydown",
		handleMaximizeShortcut((evt) => {
			if (!maximizeBtn) attachButton();
			toggleFullscreen(undefined, { noFullscreen: evt.shiftKey });
		}),
	);
}
