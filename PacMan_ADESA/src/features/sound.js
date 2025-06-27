export const sfx = {
    munch: new Howl({
        src: ['./assets/sounds/munch_1.mp3'],
        volume: 0.5,
        preload: true,
        autoplay: false,
        onload: function() {
            console.log("Munch sound loaded!");
        },
        onloaderror: function() {
            console.error("Failed to load munch sound");
        }
    }),
    death: new Howl({
        src: ['./assets/sounds/pacman_death.mp3', './assets/sounds/pacman_death.wav'],
        volume: 0.5,
        preload: true,
        autoplay: false,
        onload: function() {
            console.log("Death sound loaded!");
        },
        onloaderror: function() {
            console.error("Failed to load death sound");
        }
    }),
    beginning: new Howl({
        src: ['./assets/sounds/pacman_beginning.wav'],
        volume: 0.5,
        preload: true,
        autoplay: false,
        onload: function() {
            console.log("Beginning sound loaded!");
        },
        onloaderror: function() {
            console.error("Failed to load beginning sound");
        }
    }),
    chomp: new Howl({
        src: ['./assets/sounds/pacman_chomp.wav'],
        volume: 0.5,
        preload: true,
        autoplay: false,
        onload: function() {
            console.log("Chomp sound loaded!");
        },
        onloaderror: function() {
            console.error("Failed to load chomp sound");
        }
    }),
    powerup: new Howl({
        src: ['./assets/sounds/powerup.mp3'], // You need to provide this sound file
        volume: 0.5,
        preload: true,
        autoplay: false,
        onload: function() {
            console.log("Powerup sound loaded!");
        },
        onloaderror: function() {
            console.error("Failed to load powerup sound");
        }
    }),
    ghosteat: new Howl({
        src: ['./assets/sounds/ghosteat.mp3'], // You need to provide this sound file
        volume: 0.5,
        preload: true,
        autoplay: false,
        onload: function() {
            console.log("Ghost eat sound loaded!");
        },
        onloaderror: function() {
            console.error("Failed to load ghost eat sound");
        }
    })
};

export function muteAllSounds(muted) {
    Object.values(sfx).forEach(sound => sound.mute(muted));
}
