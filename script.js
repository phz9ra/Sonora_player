const audio = document.getElementById('audio');
const filePicker = document.getElementById('seletorMusicas');
const trackList = document.getElementById('listaMusicas');
const playPauseButton = document.getElementById('playPause');
const playPauseIcon = document.getElementById('iconePlayPause');
const currentTitle = document.getElementById('nome_musica');
const currentArtist = document.getElementById('nome_artista');
const progress = document.getElementById('barra');
const currentTimeLabel = document.getElementById('tempoAtual');
const durationLabel = document.getElementById('duracao');
const volume = document.getElementById('barraV');

let tracks = [];
let currentTrackIndex = -1;

filePicker.addEventListener('change', (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const audioFiles = selectedFiles.filter(file => file.type.startsWith('audio/'));

    audioFiles.forEach(file => {
        tracks.push({
            file,
            title: file.name.replace(/\.[^/.]+$/, ''),
            url: URL.createObjectURL(file)
        });
    });

    renderLibrary();
    
    filePicker.value = '';
});

function renderLibrary() {
    trackList.replaceChildren();

    if (tracks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'biblioteca-vazia';
        emptyMessage.textContent = 'Suas musicas selecionadas aparecero aqui.';
        trackList.appendChild(emptyMessage);
        return;
    }

    tracks.forEach((track, index) => {
        const item = document.createElement('li');
        item.className = 'faixa-biblioteca';

        const name = document.createElement('span');
        name.textContent = track.title;

        const playButton = document.createElement('button');
        playButton.type = 'button';
        playButton.textContent = index === currentTrackIndex && !audio.paused ? 'Tocando' : 'Reproduzir';
        playButton.setAttribute('aria-label', `Reproduzir ${track.title}`);
        playButton.addEventListener('click', () => playTrack(index));

        item.append(name, playButton);
        trackList.appendChild(item);
    });
}

function playTrack(index) {
    if (index < 0 || index >= tracks.length) return;

    currentTrackIndex = index;
    const track = tracks[index];
    audio.src = track.url;
    currentTitle.textContent = track.title;
    currentArtist.textContent = track.file.name;
    audio.play().catch(() => {
        
        updatePlayPauseButton();
    });
    renderLibrary();
}

function updatePlayPauseButton() {
    const isPlaying = !audio.paused;
    playPauseIcon.src = isPlaying ? 'imagenes/pause.png' : 'imagenes/play-buttton.png';
    playPauseIcon.alt = isPlaying ? 'Pause' : 'Play';
    playPauseButton.setAttribute('aria-label', isPlaying ? 'Pausar' : 'Reproduzir');
}

playPauseButton.addEventListener('click', () => {
    if (currentTrackIndex === -1) {
        if (tracks.length > 0) playTrack(0);
        return;
    }

    if (audio.paused) {
        audio.play().catch(() => {});
    } else {
        audio.pause();
    }
});

document.getElementById('retrasar').addEventListener('click', () => {
    if (tracks.length) playTrack((currentTrackIndex - 1 + tracks.length) % tracks.length);
});

document.getElementById('next').addEventListener('click', () => {
    if (tracks.length) playTrack((currentTrackIndex + 1) % tracks.length);
});

audio.addEventListener('play', () => {
    updatePlayPauseButton();
    renderLibrary();
});
audio.addEventListener('pause', () => {
    updatePlayPauseButton();
    renderLibrary();
});
audio.addEventListener('ended', () => {
    if (tracks.length > 1) playTrack((currentTrackIndex + 1) % tracks.length);
    else updatePlayPauseButton();
});

audio.addEventListener('loadedmetadata', () => {
    progress.max = Number.isFinite(audio.duration) ? audio.duration : 0;
    durationLabel.textContent = formatTime(audio.duration);
});
audio.addEventListener('timeupdate', () => {
    progress.value = audio.currentTime || 0;
    currentTimeLabel.textContent = formatTime(audio.currentTime);
});
progress.addEventListener('input', () => {
    if (Number.isFinite(audio.duration)) audio.currentTime = Number(progress.value);
});
volume.addEventListener('input', () => {
    audio.volume = Number(volume.value) / 100;
});

audio.volume = Number(volume.value) / 100;

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}
