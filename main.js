
/*  Variáveis do programa */
const player_element_id = 'player';
const template_shoot_name = '%i';
let CONFIG = {};
let DEC_YOUTUBE_VIDEO_ID = null;
let DEC_PLANOS = [];
let playing_interval;

/* Programa */
class Decupagem {

  static player = null;
  static current_shoot = 0;

  static program() {
    Decupagem.mountTimeline();
    Decupagem.writeContent();
  }

  static writeContent() {
    const shoot_list = document.querySelector('.shoot__list'); 
    for (let i = 0; i < DEC_PLANOS.length; i = i + 1) {
      shoot_list.appendChild(Decupagem.createShootContent(DEC_PLANOS[i], i));
    }
  }

  static formatTime(time) {
    if (time < 60) {
      return '00:' + ((`${time}`.length > 1) ? time : `0${time}`);
    } else {
      let min =  Math.round(time/60);
      let seg = time % 60;
      return ((`${min}`.length > 1) ? min : `0${min}`) + ":" + ((`${seg}`.length > 1) ? seg : `0${seg}`);
    }
  }

  static parseTimeString(time) {
    let s = 0, t = time.split(":");
    if (t.length === 3) {
      s += (parseInt(t[0]) * 60 * 60);
      s += (parseInt(t[1]) * 60);
      s += parseInt(t[2]);
    } else {
      s += (parseInt(t[0]) * 60);
      s += parseInt(t[1]);
    }
    return s;
  }

  static getShootStartPosition(index) {
    return Decupagem.formatTime(DEC_PLANOS[index].position);
  }

  static getShootEndPosition(index) {
    if ((index + 1) < DEC_PLANOS.length) {
      return Decupagem.formatTime(DEC_PLANOS[index+1].position);
    } else {
      return Decupagem.formatTime(Math.round(Decupagem.player.getDuration()));
    }
  }

  static getShootDuration(index) {
    if ((index + 1) < DEC_PLANOS.length) {
      return Decupagem.formatTime(DEC_PLANOS[index+1].position - DEC_PLANOS[index].position);
    } else {
      return Decupagem.formatTime(Math.round(Decupagem.player.getDuration()) - DEC_PLANOS[index].position);
    }
  }

  static createShootContent(data, index) {
    /* Shoot container */
    const shoot = document.createElement('div');
    shoot.classList.add('shoot__item');
    shoot.setAttribute('data-shootn', (index + 1))
    /* Shoot frame */
    const frame = document.createElement('a');
    frame.href = "#playshoot:" + index;
    frame.classList.add('shoot__frame');
    if (data.hasOwnProperty('image')) {
      frame.style.backgroundImage = `url('${data.image}')`;
    } else {
      frame.style.backgroundImage = `url('images/${index + 1}.jpg')`;
    }
    frame.title = 'Executar plano';
    frame.addEventListener('click', (event) => {
      let shoot_n = parseInt(event.target.parentNode.dataset.shootn) - 1;
      document.querySelectorAll('.timeline__shoot')[shoot_n].click();
    });
    shoot.appendChild(frame);
    /* Shoot info */
    const info = document.createElement('div');
    info.innerText = `Início: ${Decupagem.getShootStartPosition(index)} | Intervalo: ${Decupagem.getShootStartPosition(index)} - ${Decupagem.getShootEndPosition(index)} | Duração: ${Decupagem.getShootDuration(index)}s`;
    info.classList.add('shoot__info');
    shoot.appendChild(info);
    /* Shoot detail list */
    const detail_list = document.createElement('div');
    detail_list.classList.add('shoot__detail-list');
    if (data.hasOwnProperty('metadata')) {
      data.metadata.forEach(item => {
        if (item.length === 1) {
          const title = document.createElement('div');
          title.innerText = item[0];
          title.classList.add('shoot__group-title');
          detail_list.append(title);
        } else {
          const detail = document.createElement('div');
          detail.classList.add('shoot__detail-item');
          const label = document.createElement('div');
          label.classList.add('shoot__detail-label');
          label.innerText = item[0];
          detail.appendChild(label);
          const value = document.createElement('div');
          value.classList.add('shoot__detail-value');
          value.innerText = item[1];
          detail.appendChild(value);
          detail_list.appendChild(detail);
        }
      });
    }
    shoot.appendChild(detail_list);
    return shoot;
  }

  static mountTimeline() {
    for (let i = 0; i < DEC_PLANOS.length; i = i + 1) {
      let shoot = {
        index: i, 
        values: DEC_PLANOS[i],
        previous: (i > 0) ? DEC_PLANOS[i-1] : null,
        next: (i < (DEC_PLANOS.length - 1)) ? DEC_PLANOS[i+1] : null
      }
      Decupagem.newShoot(shoot);
    }
  }

  static newShoot(data) {
    const timeline = document.querySelector('.timeline__content');
    const shoot = document.createElement('a');
    shoot.href = "#playshoot:" + data.index;
    if (data.index === 0) {
      shoot.tabIndex = 0;
    }
    shoot.classList.add('timeline__shoot');
    if (data.values.hasOwnProperty('image')) {
      shoot.style.backgroundImage = `url('${data.values.image}')`;
    } else {
      shoot.style.backgroundImage = `url('images/${data.index + 1}.jpg')`;
    }
    shoot.innerText = template_shoot_name.replace('%i', (data.index + 1));
    shoot.title = `Executar Plano ${data.index + 1}`;
    let width;
    if (data.previous === null) {
      if (data.next === null) {
        width = 100;
      } else {
        width = (data.next.position / Decupagem.player.getDuration()) * 100;
      }
    } else {
      if (data.next === null) {
        width = 100 - ((data.values.position / Decupagem.player.getDuration()) * 100);
      } else {
        width = ((data.next.position / Decupagem.player.getDuration()) * 100) - ((data.values.position / Decupagem.player.getDuration()) * 100);
      }
    }
    shoot.style.width = `${width}%`;
    if (data.values.hasOwnProperty('color')) {
      shoot.style.backgroundColor = data.values.color;
    }
    shoot.addEventListener('click', (event) => {
      Decupagem.updateCurrentShoot(data.values.position);
      Decupagem.player.seekTo(data.values.position);
      Decupagem.player.playVideo();
    }, false);
    timeline.appendChild(shoot);
  }

  static highlightCurrentShoot() {
    const shoot = document.querySelectorAll('.timeline__shoot').forEach((shoot, index) => {
      if (index == Decupagem.current_shoot) {
        shoot.classList.add('timeline__shoot--current');
      } else {
        shoot.classList.remove('timeline__shoot--current');
      }
    });
  }

  static setPointerPosition(current_position) {
    const pointer = document.querySelector('.timeline__pointer');
    pointer.style.left = `${(current_position/Decupagem.player.getDuration()*100)}%`
  }

  static watchCurrentShoot(current_position) {
    if ((Decupagem.current_shoot + 1) < DEC_PLANOS.length) {
      if (current_position > DEC_PLANOS[Decupagem.current_shoot+1].position) {
        Decupagem.current_shoot = Decupagem.current_shoot + 1;
        Decupagem.highlightCurrentShoot();
      }
    }
  }

  static updateCurrentShoot(position) {
    for (let i = DEC_PLANOS.length; i > 0; i = i - 1) {
      if (position < DEC_PLANOS[i - 1].position) {
        continue;
      } else {
        Decupagem.current_shoot = i - 1;
        Decupagem.highlightCurrentShoot();
        break;
      }
    }
  }

  static iniciar() {
    Decupagem.inicarFilmePlayer();
  }

  static inicarFilmePlayer() {
    /* Iniciar Video Player */
    let tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    let firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  static PlayerIframeAPIReady() {
    this.player = new YT.Player(player_element_id, {
      height: '360',
      width: '640',
      videoId: DEC_YOUTUBE_VIDEO_ID,
      events: {
        'onReady': Decupagem.PlayerReady,
        'onStateChange': Decupagem.PlayerStateChange
      }
    });
  }

  static PlayerReady(event) {
    Decupagem.program();
  }

  static PlayerStateChange(event) {
    clearInterval(playing_interval)
    if (event.data == YT.PlayerState.PLAYING) {
      playing_interval = setInterval(() => {
        const current_position = Decupagem.player.getCurrentTime();
        Decupagem.setPointerPosition(current_position);
        Decupagem.watchCurrentShoot(current_position);
      }, 100);
    }
  }

}

/* Função global requerida pela API do Player */
function onYouTubeIframeAPIReady() {
  Decupagem.PlayerIframeAPIReady();
}

/* Ler arquivo com dados do video e decupagem */
fetch('decupagem.txt')
  .then((response) => response.text())
  .then((text) => {
    const li = text.split("\n");
    let l, i, m, c = '', t = false;
    for (i = 0; i < li.length; i = i +1) {
      l = li[i];
      if (l.trim() === "--- INFO" ) {
        m = "info";
        continue;
      } else if (l.trim() === "--- PLANOS" ) {
        m = "plano";
        continue;
      } else if (l.trim() === "--- VIDEO_ID" ) {
        m = "video";
        continue;
      } else if (l.trim() === "--- INFO_HTML" ) {
        m = "infohtml";
        continue;
      } else if (l.trim() === "--- CONFIG" ) {
        m = "config";
        continue;
      }
      if (m === "plano") {
        l = l.trim();
        if (l === "") continue;
        if (/\[{2,2}\d{2,2}\:\d{2,2}\:\d{2,2}\]{2,2}/.test(l)) {
          DEC_PLANOS.push({
            position: Decupagem.parseTimeString(l.match(/\d{2,2}\:\d{2,2}\:\d{2,2}/)[0]),
            metadata:[],
          })
        } else if (/^\$/.test(l)) {
          DEC_PLANOS[DEC_PLANOS.length-1][l.split(':')[0].replace('$','').trim()] = l.slice(l.search(':')+1, l.length).trim();
        } else {
          if (/^#/.test(l)) {
            DEC_PLANOS[DEC_PLANOS.length-1].metadata.push([l.replace('#', '')]);
          } else {
            DEC_PLANOS[DEC_PLANOS.length-1].metadata.push([ l.split("|")[0].trim(), l.split("|")[1].trim() ]);
          }
        }
      } else if (m === "video") {
        l = l.trim();
        if (l !== "") {
          DEC_YOUTUBE_VIDEO_ID = l.trim();  
        }
      } else if (m === "info") {
        if (!t) {
          l = l.trim();
          if (l === "") continue;
          document.querySelector('.content').appendChild(document.createElement('h1'));
          document.querySelector('.content h1').innerText = l;
          document.title = l;
          document.querySelector('.content').appendChild(document.createElement('p'));
          t = true;
        } else {
          document.querySelector('.content p').innerHTML = document.querySelector('.content p').innerHTML + l + "<br />\n";
        }
      } else if (m === "infohtml") {
        if (!t) {
          l = l.trim();
          if (l === "") continue;
          document.querySelector('.content').appendChild(document.createElement('h1'));
          document.querySelector('.content h1').innerText = l;
          document.title = l;
          t = true;
        } else {
          c = c + l;
        }
      } else if (m === "config") {
        l = l.trim();
        if (l === "") continue;
        if (/^\$/.test(l)) {
          CONFIG[l.split(':')[0].replace('$','').trim()] = l.slice(l.search(':')+1, l.length).trim();
        }
      }
    }
    if (c !== "") {
      document.querySelector('.content').innerHTML = document.querySelector('.content').innerHTML + c;
    }
    /* Verifica */
    if (DEC_YOUTUBE_VIDEO_ID === null) {
      window.alert('Video ID não definido');
    } else if (DEC_PLANOS.length === 0) {
      window.alert('Não há nenhum plano definido.');
    } else {
      /* Inicia */
      if (CONFIG.hasOwnProperty('themeColor')) {
        console.log(CONFIG.themeColor);
        document.querySelector(':root').style.setProperty('--theme-color', CONFIG.themeColor);
      }
      Decupagem.iniciar();
    }
});