function updateLocation(location) {
    const locationElement = document.getElementById('cidade');
    if (!locationElement) {
        return;
    }
    locationElement.textContent = location;
}

function getIPLocation() {
    const request = new XMLHttpRequest();
    request.open('GET', 'https://wtfismyip.com/json', true);

    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            const data = JSON.parse(request.responseText);
            const location = data.YourFuckingLocation.replace(/\,.+/g, "$'");
            updateLocation(location);
        } else {
            updateLocation("Cidade Desconhecida");
        }
    };

    request.onerror = function () {
        updateLocation("Erro na requisição");
    };

    request.send();
}

getIPLocation();



function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}


function updateProgramDate() {
    const programDateElement = document.getElementById('data');
    if (!programDateElement) {
        return;
    }

    
    const brazilTimeZone = 'America/Sao_Paulo';
    const now = luxon.DateTime.local().setZone(brazilTimeZone);

    
    const currentMonth = now.month;
    const currentYear = now.year;

    
    let maxDays = 30; 

    if (currentMonth === 2) { 
        maxDays = isLeapYear(currentYear) ? 29 : 28;
    } else if ([4, 6, 9, 11].includes(currentMonth)) {
        maxDays = 30;
    } else {
        maxDays = 31;
    }

    const formattedStartDate = now.toFormat('dd/MM/yyyy');

    programDateElement.textContent = formattedStartDate;
}

window.addEventListener('load', updateProgramDate);



const scrollers = document.querySelectorAll(".scroller");
  addAnimation();

function addAnimation() {
  scrollers.forEach((scroller) => {
    scroller.setAttribute("data-animated", true);

    const scrollerInner = scroller.querySelector(".scroller__inner");
    const scrollerContent = Array.from(scrollerInner.children);
    scrollerContent.forEach((item) => {
      const duplicatedItem = item.cloneNode(true);
      duplicatedItem.setAttribute("aria-hidden", true);
      scrollerInner.appendChild(duplicatedItem);
    });
  });
}

var swiper = new Swiper('.swiper-container', {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    autoplay: {
      delay: 5000, 
      disableOnInteraction: false,
    },
	pagination: {
  el: '.swiper-pagination',
  clickable: true,
},
	navigation: {
  nextEl: '.swiper-button-next',
  prevEl: '.swiper-button-prev',
},
    breakpoints: {
      768: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
      },
    },
  });

  document.addEventListener('DOMContentLoaded', function () {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            faqItems.forEach(otherItem => {
                const otherQuestion = otherItem.querySelector('.faq-question');
                const otherAnswer = otherItem.querySelector('.faq-answer');
                otherQuestion.classList.remove('active');
                otherItem.classList.remove('active');
                otherAnswer.style.maxHeight = null;
                otherAnswer.style.padding = '0 20px';
            });

            if (!isActive) {
                question.classList.add('active');
                item.classList.add('active');
                answer.style.maxHeight = (answer.scrollHeight + 20) + 'px';
                answer.style.padding = '10px 20px 20px';
            }
        });
    });
});

const names = [
    "Matheus", "Carlos", "Ana", "João", "Maria", "Lucas", "Gabriela", 
    "Fernando", "Beatriz", "Paulo", "Rafael", "Bruno", "Diego", "Vinícius", 
    "Ricardo", "Gustavo", "Henrique", "Eduardo", "Tiago", "Rodrigo"
];
const plans = ["WHEY-PROTEIN", "CREATINA", "PRÉ-WORKOUT"];

function generateNotification() {
    const name = names[Math.floor(Math.random() * names.length)];
    const plan = plans[Math.floor(Math.random() * plans.length)];
    const container = document.querySelector('.notification-container');
    
    
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.innerHTML = `
        <ion-icon name="checkmark-circle-outline"></ion-icon>
        <span class="notification-text">${name.toUpperCase()} COMPROU SUPLEMENTO ${plan}</span>
    `;
    
    
    container.appendChild(notification);

    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}


document.addEventListener("DOMContentLoaded", () => {
    setTimeout(generateNotification, Math.random() * (10000) + 3000);
    setInterval(generateNotification, 20000);
});


// Gera um valor inicial aleatório 
let currentViewerCount = Math.floor(Math.random() * (1 - 2 + 1)) + 1;

function updateViewerCount() {
    const viewerCountElement = document.getElementById('viewer-count');
    
    const isIncreasing = Math.random() < 0.5; 
    const changeAmount = isIncreasing
        ? Math.floor(Math.random() * (35 - 15 + 1)) + 15 
        : Math.floor(Math.random() * (12 - 3 + 1)) + 3;
    
    if (isIncreasing) {
        currentViewerCount = Math.min(currentViewerCount + changeAmount, 212); // Não ultrapassa 1896
    } else {
        currentViewerCount = Math.max(currentViewerCount - changeAmount, 12); // Não desce abaixo de 34
    }

    // Atualiza o texto no elemento
    viewerCountElement.textContent = currentViewerCount;
}

setInterval(updateViewerCount, Math.random() * (10000 - 5000) + 5000);

document.addEventListener("DOMContentLoaded", () => {
    const viewerCountElement = document.getElementById('viewer-count');
    viewerCountElement.textContent = currentViewerCount;
});

document.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById("hero-video");
    if (!video) {
        return;
    }

    const controls = document.querySelector(".video-controls");
    const toggleBtn = document.querySelector('.video-btn[data-action="toggle"]');
    const muteBtn = document.querySelector('.video-btn[data-action="mute"]');
    const rateBtns = document.querySelectorAll('.video-btn[data-action="rate"]');
    let hideControlsTimer;

    const setActiveRate = (rate) => {
        rateBtns.forEach((btn) => {
            const btnRate = Number(btn.dataset.rate);
            btn.classList.toggle("is-active", btnRate === rate);
        });
    };

    setActiveRate(1);

    const setMuteLabel = () => {
        if (!muteBtn) {
            return;
        }
        muteBtn.textContent = video.muted ? "Unmute" : "Mute";
    };

    const tryPlay = () => {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.then === "function") {
            playPromise
                .then(() => {
                    if (toggleBtn) {
                        toggleBtn.textContent = "Pause";
                    }
                    setMuteLabel();
                    scheduleHideControls();
                })
                .catch(() => {
                    if (toggleBtn) {
                        toggleBtn.textContent = "Play";
                    }
                    setMuteLabel();
                    scheduleHideControls();
                });
        }
    };

    const showControls = () => {
        if (!controls) {
            return;
        }
        controls.classList.remove("is-hidden");
    };

    const scheduleHideControls = () => {
        if (!controls) {
            return;
        }
        clearTimeout(hideControlsTimer);
        hideControlsTimer = setTimeout(() => {
            controls.classList.add("is-hidden");
        }, 1500);
    };

    video.muted = true;
    tryPlay();

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            if (video.paused) {
                video.play()
                    .then(() => {
                        toggleBtn.textContent = "Pause";
                    })
                    .catch(() => {
                        toggleBtn.textContent = "Play";
                    });
            } else {
                video.pause();
                toggleBtn.textContent = "Play";
            }
            showControls();
            scheduleHideControls();
        });
    }

    if (muteBtn) {
        muteBtn.addEventListener("click", () => {
            video.muted = !video.muted;
            setMuteLabel();
            if (video.muted === false && video.paused) {
                video.play().catch(() => {});
            }
            showControls();
            scheduleHideControls();
        });
    }

    rateBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const rate = Number(btn.dataset.rate) || 1;
            video.playbackRate = rate;
            setActiveRate(rate);
            showControls();
            scheduleHideControls();
        });
    });

    video.addEventListener("mousemove", () => {
        showControls();
        scheduleHideControls();
    });

    video.addEventListener("click", () => {
        showControls();
        scheduleHideControls();
    });

    video.addEventListener("play", () => {
        if (toggleBtn) {
            toggleBtn.textContent = "Pause";
        }
    });

    video.addEventListener("pause", () => {
        if (toggleBtn) {
            toggleBtn.textContent = "Play";
        }
    });

    video.addEventListener("volumechange", setMuteLabel);
    setMuteLabel();
    scheduleHideControls();
});

