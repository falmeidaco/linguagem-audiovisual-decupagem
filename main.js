/* Id do vídeo do youtube */
const DEC_YOUTUBE_VIDEO_ID = 'b0NL265B11w';

/* Dados da decupagem */
const DEC_PLANOS = [
  {
    position: 0,
    name: 'Plano %i',
    type: 'Over th showder',
    metadata:[
      ['Plano'],
      ['Plano','Grande Plano Geral'],
      ['Tipo de Plano','Plano de Lugar'],
      ['Câmera'],
      ['Câmera','Ângulo Baixo'],
      ['Movimento','Zoom-in'],
      ['Sons'],
      ['Sons Diegéticos','Sons de trânsito (carros, motos)'],
      ['Sons Não Diegéticos','Nenhum'],
    ],
  },
  {
    position: 6,
    name: 'Plano %i',
    type: 'Over the sholder',
    metadata:[
      ['Plano'],
      ['Plano','Over the sholder'],
      ['Tipo de Plano','Over the sholder'],
      ['Câmera'],
      ['Câmera','Eye-level'],
      ['Movimento','-'],
      ['Sons'],
      ['Sons Diegéticos','Som da televisão, campainha {3.55}'],
      ['Sons Não Diegéticos','Nenhum'],
    ],
  },
  {
    position: 19,
    name: 'Plano %i',
    type: 'Grande Plano Geral',
  },
  {
    position: 25,
    name: 'Plano %i',
    type: 'Grande Plano Geral',
  },
  {
    position: 31,
    name: 'Plano %i',
    type: 'Grande Plano Geral',
  },
  {
    position: 46,
    name: 'Plano %i',
    type: 'Grande Plano Geral',
  },
  {
    position: 48,
    name: 'Plano %i',
    type: 'Grande Plano Geral',
  },
  {
    position: 57,
    name: 'Plano %i',
    type: 'Grande Plano Geral',
  },
  {
    position: 60,
    name: 'Plano %i',
    type: 'Grande Plano Geral',
  },
]

/*  Variáveis do programa */

const player_element_id = 'player';
const template_shoot_name = '%i';
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
    const frame = document.createElement('div');
    frame.classList.add('shoot__frame');
    frame.style.backgroundImage = `url(images/${index + 1}.png)`;
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
    const shoot = document.createElement('div');
    shoot.classList.add('timeline__shoot');
    shoot.style.backgroundImage = `url("images/${data.index+1}.png")`;
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
      if (data.values.hasOwnProperty('color')) {
        timeline.parentElement.parentElement.style.setProperty('--shadow-color',  data.values.color );
      } else {
        timeline.parentElement.parentElement.style.setProperty('--shadow-color', 'white');
      }
      Decupagem.player.seekTo(data.values.position);
      Decupagem.player.playVideo();
    }, false);
    timeline.appendChild(shoot);
  }

  static highlightCurrentShoot() {
    if (DEC_PLANOS[Decupagem.current_shoot].hasOwnProperty('color')) {
      document.querySelector('.player__container').style.setProperty('--shadow-color', DEC_PLANOS[Decupagem.current_shoot].color);
    } else {
      document.querySelector('.player__container').style.setProperty('--shadow-color', 'white');
    }
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

Decupagem.iniciar();