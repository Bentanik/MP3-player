const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,

  song: [
    {
      name: "Do For Love",
      singer: "2Pac",
      path: "./assets/music/DoForLove(2Pac).mp3",
      image: "./assets/images/DoForLoveTheme.jpg",
    },
    {
      name: "Brand New Story",
      singer: "GENERATIONS from EXILE TRIBE ",
      path: "./assets/music/BrandNewStory.mp3",
      image: "./assets/images/brandnewstorytheme.jpg",
    },
    {
      name: "Fukashigi No Carte",
      singer: "Mai Sakurajima(CV:Asami Seto)",
      path: "./assets/music/Fukashigi No Carte.mp3",
      image: "./assets/images/fukashigi no carte theme.jpg",
    },
    {
      name: "けんかをやめて",
      singer: "Naoko Kawai",
      path: "./assets/music/けんかをやめて.mp3",
      image: "./assets/images/けんかをやめて Theme.jpg",
    },
    {
      name: "Sweet Memories (Re-Mix Version)",
      singer: "Seiko Matsuda",
      path: "./assets/music/Sweet Memories (Re-Mix Version).mp3",
      image: "./assets/images/Sweet Memories Theme.jpg",
    },
  ],
  render() {
    const htmls = this.song.map((song, index) => {
      return `<div class="song ${
        index === this.currentIndex ? "active" : ""
      }" data-index = "${index}">
              <div
                class="thumb"
                style="
                  background-image: url('${song.image}');
                "
                ;
              ></div>
              <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
              </div>
              <div class="option">
                <i class="fas fa-ellipsis-h"></i>
              </div>
            </div>`;
    });
    playlist.innerHTML = htmls.join("");
  },
  defineProperties() {
    Object.defineProperty(this, "currentSong", {
      get() {
        return this.song[this.currentIndex];
      },
    });
  },
  handleEvents() {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    // Xử lý CD quay / dừng
    const cdThumbAnimate = cdThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000,
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    // Xử lý phóng to, thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Xử lý khi click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // Khi song được play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add("playing");
      cdThumbAnimate.play();
    };

    // Khi song bị pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove("playing");
      cdThumbAnimate.pause();
    };

    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercen = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercen;
      }
      console.log((audio.currentTime / audio.duration) * 100);
    };

    // Xử lý khi tua song
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    // Khi next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Khi prev song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Xử lý Random song
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      randomBtn.classList.toggle("active", _this.isRandom);
    };

    // Xử lý lặp lại song
    repeatBtn.onlick = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // Xử lý next song khi audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // Lắng nghe hành vi click vào playlist
    playlist.onclick = function (e) {
      // Xử lý khi click song
      const songNode = e.target.closest(".song:not(.active)");
      if (songNode || e.target.closest(".option")) {
        // Xử lý khi click vào song
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }
      }
    };
  },

  scrollToActiveSong() {
    setTimeout(function () {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 500);
  },
  loadCurrentSong() {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url("${this.currentSong.image}")`;
    audio.src = this.currentSong.path;
  },
  nextSong() {
    this.currentIndex++;
    if (this.currentIndex >= this.song.length) this.currentIndex = 0;
    this.loadCurrentSong();
  },
  prevSong() {
    this.currentIndex--;
    if (this.currentIndex < 0) this.currentIndex = this.song.length - 1;
    this.loadCurrentSong();
  },
  playRandomSong() {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.song.length);
    } while (this.currentIndex === newIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  start() {
    // Định nghĩa thuộc tính object
    this.defineProperties();

    // Lắng nghe xử lý các sự kiện
    this.handleEvents();

    // Tải thông tin bài hát đầu tiên khi chạy ứng dụng
    this.loadCurrentSong();

    // Render playlist
    this.render();
  },
};

app.start();
