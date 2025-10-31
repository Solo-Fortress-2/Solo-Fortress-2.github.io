/*
    Copyright (c) 2025 The Solo Fortress 2 Team, all rights reserved.
    Licensed under the BSD 3-Clause License
*/

class SF2VideoPlayer extends HTMLElement {
    connectedCallback() {
        const src = this.getAttribute('src') || '';
        const width = this.getAttribute('width') || '640';
        const height = this.getAttribute('height') || '640';
        
        this.attachShadow({ mode: "open" });

        const style = new CSSStyleSheet;
        style.replaceSync(`
/* material-symbols-outlined.css */
/* fallback */
@font-face {
    font-family: 'Material Symbols Outlined';
    font-style: normal;
    font-weight: 400;
    src: url("https://fonts.gstatic.com/s/materialsymbolsoutlined/v292/kJF1BvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oDMzByHX9rA6RzaxHMPdY43zj-jCxv3fzvRNU22ZXGJpEpjC_1v-p_4MrImHCIJIZrDCvHOej.woff2") format('woff2');
}

.material-symbols-outlined {
    font-family: 'Material Symbols Outlined';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-feature-settings: 'liga';
    -webkit-font-smoothing: antialiased;
}

/* sf2-video-player.css */
video::-webkit-media-controls {
    display: none;
}

video::-webkit-media-controls-play-button {
    display: none;
}

video::-webkit-media-controls-volume-slider {
    display: none;
}

video::-webkit-media-controls-mute-button {
    display: none;
}

video::-webkit-media-controls-timeline {
    display: none;
}

video::-webkit-media-controls-current-time-display {
    display: none;
}

.sf2-player-video {
    width: 100%;
    height: auto;
    display: block;
}

.sf2-video-player-container {
    position: relative;
    background-color: black;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

:fullscreen .sf2-video-player,
.sf2-video-player-container:fullscreen video {
    width: 100vw;
    height: 100vh;
    object-fit: contain;
}

.sf2-video-player-controls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
    color: white;
}

.sf2-video-player-controls button {
    background-color: rgba(255, 255, 255, 0.2);
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    border: none;
    cursor: pointer;
	transition: background-color 0.2s ease;
	color: white;
	font-family: 'Material Symbols Outlined';
	font-size: 24px;
	line-height: 1;
	display: flex;
	align-items: center;
	justify-content: center;
}

.sf2-video-player-controls button:hover {
    background-color: rgba(255, 255, 255, 0.3);
}

.sf2-video-player-progress {
    flex-grow: 1;
    margin: 0 0.75rem;
    accent-color: oklch(55.8% 0.288 302.321);
}

.sf2-video-player-volume {
    width: 6rem;
    accent-color: oklch(55.8% 0.288 302.321);
}

.sf2-video-player-time {
  	font-size: 0.875rem;
  	white-space: nowrap;
  	user-select: none;
  	margin: 0 0.75rem;
}
        `);
        this.shadowRoot.adoptedStyleSheets.push(style);

        const container = document.createElement('div');
        container.className = 'sf2-video-player-container';
        container.tabIndex = 0;
        const autoplay = this.hasAttribute('autoplay');
        const muted = this.hasAttribute('muted');
        const loop = this.hasAttribute('loop');
        const poster = this.getAttribute('poster');
        container.innerHTML = `
        <video class="sf2-video-player" width="${width}" height="${height}" src="${src}" ${autoplay ? 'autoplay' : ''} ${muted ? 'muted' : ''} ${loop ? 'loop' : ''} ${poster ? `poster="${poster}"` : ''} playsinline></video>
        <div class="sf2-video-player-controls">
            <button class="play-pause" aria-label="Play"><span class="material-symbols-outlined" aria-hidden="true">play_arrow</span></button>
            <span class="sf2-video-player-time">0:00 / 0:00</span>
            <input class="sf2-video-player-progress" type="range" min="0" max="0" value="0" step="0.1" aria-label="Seek" disabled>
            <button class="mute" aria-label="Mute"><span class="material-symbols-outlined" aria-hidden="true">volume_up</span></button>
            <input class="sf2-video-player-volume" type="range" min="0" max="1" step="0.05" value="1" aria-label="Volume">
            <button class="fullscreen" aria-label="Enter fullscreen"><span class="material-symbols-outlined" aria-hidden="true">fullscreen</span></button>
        </div>
        `;
        this.shadowRoot.appendChild(container);

        const video = container.querySelector('video');
        const playPause = container.querySelector('.play-pause');
        const playPauseIcon = playPause.querySelector('.material-symbols-outlined');
        const progress = container.querySelector('.sf2-video-player-progress');
        const volume = container.querySelector('.sf2-video-player-volume');
        const fullscreen = container.querySelector('.fullscreen');
        const fullscreenIcon = fullscreen.querySelector('.material-symbols-outlined');
        const mute = container.querySelector('.mute');
        const muteIcon = mute.querySelector('.material-symbols-outlined');
        const timeDisplay = container.querySelector('.sf2-video-player-time');

        video.removeAttribute('controls');

        const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
        const isFiniteNumber = (n) => typeof n === 'number' && isFinite(n);
        const formatTime = (seconds) => {
            if (!isFiniteNumber(seconds) || seconds < 0) return '0:00';
            const total = Math.floor(seconds);
            const hrs = Math.floor(total / 3600);
            const mins = Math.floor((total % 3600) / 60);
            const secs = total % 60;
            if (hrs > 0) {
                return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

        const updateTime = () => {
            const current = formatTime(video.currentTime);
            const total = formatTime(video.duration);
            timeDisplay.textContent = `${current} / ${total}`;
        };

        const updatePlayPauseIcon = () => {
            if (video.paused) {
                playPauseIcon.textContent = 'play_arrow';
                playPause.setAttribute('aria-label', 'Play');
            } else {
                playPauseIcon.textContent = 'pause';
                playPause.setAttribute('aria-label', 'Pause');
            }
        };

        const updateMuteIcon = () => {
            const isMuted = video.muted || video.volume === 0;
            muteIcon.textContent = isMuted ? 'volume_off' : 'volume_up';
            mute.setAttribute('aria-label', isMuted ? 'Unmute' : 'Mute');
        };

        const updateFullscreenIcon = () => {
            const isFs = document.fullscreenElement === container;
            fullscreenIcon.textContent = isFs ? 'fullscreen_exit' : 'fullscreen';
            fullscreen.setAttribute('aria-label', isFs ? 'Exit fullscreen' : 'Enter fullscreen');
        };

        playPause.addEventListener('click', () => {
            if (video.paused) video.play();
            else video.pause();
        });

        video.addEventListener('play', updatePlayPauseIcon);
        video.addEventListener('pause', updatePlayPauseIcon);

        video.addEventListener('timeupdate', () => {
            if (isFiniteNumber(video.currentTime)) {
                progress.value = video.currentTime;
            }
            updateTime();
        });

        progress.addEventListener('input', () => {
            const desired = parseFloat(progress.value);
            if (isFiniteNumber(video.duration)) {
                video.currentTime = clamp(desired, 0, video.duration);
            }
        });

        volume.addEventListener('input', () => {
            video.volume = parseFloat(volume.value);
            updateMuteIcon();
        });

        mute.addEventListener('click', () => {
            video.muted = !video.muted;
            updateMuteIcon();
        });

        fullscreen.addEventListener('click', () => {
            const isFs = document.fullscreenElement === container;
            if (!isFs) {
                container.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch?.(() => {});
            }
        });

        document.addEventListener('fullscreenchange', () => {
            updateFullscreenIcon();
        });

        video.addEventListener('loadedmetadata', () => {
            if (isFiniteNumber(video.duration) && video.duration > 0 && video.duration !== Infinity) {
                progress.max = video.duration;
                progress.disabled = false;
            } else {
                progress.max = 0;
                progress.disabled = true;
            }
            updateTime();
        });

        video.addEventListener('volumechange', () => {
            volume.value = String(video.volume);
            updateMuteIcon();
        });

        container.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            switch (key) {
                case 'k':
                case ' ': // Space
                case 'enter':
                    e.preventDefault();
                    if (video.paused) video.play(); else video.pause();
                    break;
                case 'arrowleft':
                    e.preventDefault();
                    video.currentTime = clamp(video.currentTime - 5, 0, isFiniteNumber(video.duration) ? video.duration : Number.MAX_SAFE_INTEGER);
                    break;
                case 'arrowright':
                    e.preventDefault();
                    video.currentTime = clamp(video.currentTime + 5, 0, isFiniteNumber(video.duration) ? video.duration : Number.MAX_SAFE_INTEGER);
                    break;
                case 'arrowup':
                    e.preventDefault();
                    video.volume = clamp(video.volume + 0.05, 0, 1);
                    break;
                case 'arrowdown':
                    e.preventDefault();
                    video.volume = clamp(video.volume - 0.05, 0, 1);
                    break;
                case 'm':
                    e.preventDefault();
                    video.muted = !video.muted;
                    break;
                case 'f':
                    e.preventDefault();
                    const isFs = document.fullscreenElement === container;
                    if (!isFs) container.requestFullscreen().catch(() => {});
                    else document.exitFullscreen().catch?.(() => {});
                    break;
                default:
                    break;
            }
        });

        updatePlayPauseIcon();
        updateMuteIcon();
        updateFullscreenIcon();
    }
}

customElements.define('sf2-video-player', SF2VideoPlayer);
