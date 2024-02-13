var folder;
var data;
let songs;
var currSong = new Audio();

async function displayAlbum() {
  data = await fetch(`http://127.0.0.1:5500/song/`);
  const result = await data.text();
  const div = document.createElement("div");
  div.innerHTML = result;

  const card_container = document.querySelector(".card-container");
  const anchors = div.getElementsByTagName("a");
  const arr = Array.from(anchors);
  for (const elm of arr) { 
    if (elm.href.includes("/song/")) {
      let folder = elm.href.split("/").slice(-1)[0];
      let a = await fetch(`http://127.0.0.1:5500/song/${folder}/info.json`);
      let response = await a.json();
      card_container.innerHTML += `
      <div class="card" data-folder=${folder}>
                    <div class="image-box">
                        <img src="/song/${folder}/cover.jpeg"
                            alt="" width="100%">
                    </div>
                    <h4>${response.title}</h4>
                    <span>${response.description}</span>
                    <div class="play-button">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                stroke-linejoin="round"></path>
                        </svg>
                    </div>
                </div>
      `;
    }
  }

}

const main = async (arg) => {
  // displayAlbum();

  data = await fetch(arg);
  const result = await data.text();
  const div = document.createElement("div");
  div.innerHTML = result;
  // console.log(result)
  const Arr = div.getElementsByTagName("a");
  songs = [];
  for (let i = 0; i < Arr.length; i++) {
    if (Arr[i].href.endsWith(".mp3")) {
      songs.push(Arr[i].href);
    }
  }
  var list = document.getElementById("song-list");
  list.innerHTML = "";
  for (let i = 0; i < songs.length; i++) {
    list.innerHTML += `
        <li>
            <span>${songs[i]
              .replace(`${arg}/`, "")
              .replaceAll("%20", " ")}</span>
            <i class="fa-solid fa-play"></i>
        </li>
        `;
  }

  var arr = Array.from(list.children);

  var song_name = document.getElementsByClassName("song-name")[0];
  song_name.innerHTML = arr[0].getElementsByTagName("span")[0].innerHTML;
  currSong.src = "song/" + arr[0].getElementsByTagName("span")[0].innerHTML;
  // console.log(currSong.currentTime);
  document.querySelector(".progress-bar").value = 0;

  var song_list = [];
  for (const item of arr) {
    const val = item.getElementsByTagName("span")[0].innerHTML;
    song_list.push(val);
    item.addEventListener("click", () => {
      playSong(val, arg.split("/").slice(-1)[0]);

      var song_name = document.getElementsByClassName("song-name")[0];
      song_name.innerHTML = val;

      var play_pause_button = document.getElementsByClassName("play")[0];
      play_pause_button.innerHTML = '<i class="fa-solid fa-pause"></i>';
    });
  }

  function formatTime(seconds) {
    if (!isNaN(seconds)) {
      // Check if the value is a valid number
      var minutes = Math.floor(seconds / 60);
      var seconds = Math.floor(seconds - minutes * 60);
      var formatted = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
      return formatted;
    } else {
      return "00:00"; // Return a default value if the input is not valid
    }
  }

  currSong.addEventListener("timeupdate", () => {
    document.querySelector(".song-length").innerHTML = `${formatTime(
      currSong.currentTime
    )}/${formatTime(currSong.duration)}`;
    const playedPercentage = (currSong.currentTime / currSong.duration) * 100;
    const bar = document.querySelector(".progress-bar");
    bar.value = playedPercentage;
    bar.addEventListener("click", (e) => {
      let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
      bar.value = percent;
      currSong.currentTime = (currSong.duration * percent) / 100;
    });
  });

  // console.log(songs);
  const prev = document.querySelector(".prev");
  prev.addEventListener("click", () => {
    const index = songs.indexOf(currSong.src);
    console.log(index);
    if (index - 1 >= 0) {
      currSong.src = songs[index - 1];
      currSong.addEventListener("canplay", () => {
        currSong.play();
      });
      document.getElementsByClassName("song-name")[0].innerHTML = currSong.src
        .replace(`${arg}/`, "")
        .replaceAll("%20", " ");
    } else {
      currSong.src = songs[songs.length - 1];
      currSong.addEventListener("canplay", () => {
        currSong.play();
      });
      document.getElementsByClassName("song-name")[0].innerHTML = currSong.src
        .replace(`${arg}/`, "")
        .replaceAll("%20", " ");
    }
  });

  const next = document.querySelector(".next");
  next.addEventListener("click", () => {
    const index = songs.indexOf(currSong.src);
    // console.log(index)
    if (index + 1 < songs.length) {
      currSong.src = songs[index + 1];
      currSong.addEventListener("canplay", () => {
        currSong.play();
      });
      document.getElementsByClassName("song-name")[0].innerHTML = currSong.src
        .replace(`${arg}/`, "")
        .replaceAll("%20", " ");
    } else {
      currSong.src = songs[0];
      currSong.addEventListener("canplay", () => {
        currSong.play();
      });
      document.getElementsByClassName("song-name")[0].innerHTML = currSong.src
        .replace(`${arg}/`, "")
        .replaceAll("%20", " ");
    }
  });
};
main("http://127.0.0.1:5500/song/a-c");

const playSong = (val, name) => {
  currSong.src = `song/${name}/` + val;
  currSong.play();
};

const playPauseSong = () => {
  if (currSong.paused) {
    currSong.play();
    play_pause_button.innerHTML = '<i class="fa-solid fa-pause"></i>';
  } else {
    currSong.pause();
    play_pause_button.innerHTML = '<i class="fa-solid fa-play"></i>';
  }
};

var play_pause_button = document.getElementsByClassName("play")[0];
play_pause_button.addEventListener("click", () => {
  playPauseSong();
});

const volume = document.querySelector("#volume");
volume.addEventListener("change", (e) => {
  currSong.volume = e.target.value / 100;

  const volume_logo = document.querySelector(".vol-logo");
  if (currSong.volume === 0) {
    volume_logo.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
  } else {
    volume_logo.innerHTML = '<i class="fa-solid fa-volume-high "></i>';
  }
});

Array.from(document.getElementsByClassName("card")).forEach((e) => {
  e.addEventListener("click", async (item) => {
    console.log("hello")
    main(`http://127.0.0.1:5500/song/${item.currentTarget.dataset.folder}`);
  });
});


const ham = document.querySelector(".hamburger");
const Left = document.querySelector(".left");
var cond = true;
ham.addEventListener("click", () => {
  if (cond) {
    Left.style.left = "0%";
    cond = false;
  } else {
    Left.style.left = "-100%";
    cond = true;
  }
});
