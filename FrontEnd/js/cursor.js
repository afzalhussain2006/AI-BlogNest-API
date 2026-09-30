const cursor = document.getElementById('cursor-triangle');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let lastStarTime = 0;

const isTouchDevice =
  window.matchMedia('(hover: none), (pointer: coarse)').matches;

if (!isTouchDevice && cursor) {

  window.addEventListener('mousemove', (event) => {

    mouseX = event.clientX;
    mouseY = event.clientY;

    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;

    const now = Date.now();

    if (now - lastStarTime > 35) {

      createStar(
        mouseX,
        mouseY
      );

      lastStarTime = now;
    }
  });

  window.addEventListener('click', (event) => {

    createRipple(
      event.clientX,
      event.clientY
    );

  });

}

function createStar(x, y) {

  const star =
    document.createElement('div');

  star.className = 'cursor-star';

  const spread = 8;

  star.style.left =
    `${x + (Math.random() * spread - spread / 2)}px`;

  star.style.top =
    `${y + (Math.random() * spread - spread / 2)}px`;

  document.body.appendChild(star);

  setTimeout(() => {
    star.remove();
  }, 700);
}

function createRipple(x, y) {

  const ripple =
    document.createElement('div');

  ripple.className =
    'cursor-ripple';

  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  document.body.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 800);
}
