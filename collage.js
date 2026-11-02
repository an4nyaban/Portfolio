(function () {
  'use strict';
  var viewport = document.getElementById('collage-viewport');
  var camera = document.getElementById('collage-camera');
  var world = document.getElementById('collage-world');
  var dialog = document.getElementById('collage-viewer');
  var mediaHost = document.getElementById('collage-viewer-media');
  var heading = document.getElementById('collage-viewer-title');
  var closeButton = dialog.querySelector('.collage-viewer-close');
  var status = document.getElementById('collage-status');
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var items = Array.from(world.querySelectorAll('.motion-item'));
  var W = 2362, H = 1783;
  var cx = 1181, cy = 847, scale = 1;
  var ready = false, running = false, lastTime = 0;
  var vx = 0, vy = 0, keys = new Set();
  var opener = null, drag = null, suppressClick = false;
  var intros = [];
  var visibleVideos = new Set();

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function constrain() {
    var halfW = viewport.clientWidth / (2 * scale);
    var halfH = viewport.clientHeight / (2 * scale);
    cx = halfW > W / 2 ? W / 2 : clamp(cx, halfW, W - halfW);
    cy = halfH > H / 2 ? H / 2 : clamp(cy, halfH, H - halfH);
  }
  function draw() {
    constrain();
    camera.style.transform = 'translate(' + (viewport.clientWidth / 2 - cx * scale) + 'px,' + (viewport.clientHeight / 2 - cy * scale) + 'px) scale(' + scale + ')';
  }
  function resize() {
    scale = Math.max(.38, viewport.clientWidth / W, viewport.clientHeight / H, Math.min(1, viewport.clientWidth / 1440));
    draw();
  }
  resize();
  window.addEventListener('resize', resize);
  function stopMovement() { vx = 0; vy = 0; keys.clear(); }
  function tick(time) {
    if (!ready || dialog.open || document.hidden) { running = false; return; }
    var dt = Math.min(.04, (time - lastTime) / 1000 || .016);
    lastTime = time;
    var dx = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0);
    var dy = (keys.has('ArrowDown') ? 1 : 0) - (keys.has('ArrowUp') ? 1 : 0);
    var speed = 520 / Math.max(.65, scale);
    var previousX = cx, previousY = cy;
    cx += (dx || vx) * speed * dt;
    cy += (dy || vy) * speed * dt;
    draw();
    if ((dx || dy || vx || vy) && (previousX !== cx || previousY !== cy)) requestAnimationFrame(tick);
    else running = false;
  }
  function animatePan() {
    if (!running && ready && !dialog.open) { running = true; lastTime = performance.now(); requestAnimationFrame(tick); }
  }
  function edgeSpeed(value, extent) {
    var edge = Math.min(180, extent * .22);
    if (value < edge) return -(1 - value / edge);
    if (value > extent - edge) return (value - extent + edge) / edge;
    return 0;
  }
  viewport.addEventListener('pointermove', function (event) {
    if (!ready || dialog.open) return;
    if (drag && event.pointerId === drag.id) {
      var dx = event.clientX - drag.lastX, dy = event.clientY - drag.lastY;
      if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 7) drag.moved = true;
      if (drag.moved) {
        viewport.setPointerCapture(event.pointerId);
        if (drag.sticker) {
          var width = parseFloat(drag.sticker.style.width);
          var height = parseFloat(drag.sticker.style.height);
          drag.sticker.style.left = clamp(drag.left + (event.clientX - drag.x) / scale, 0, W - width) + 'px';
          drag.sticker.style.top = clamp(drag.top + (event.clientY - drag.y) / scale, 0, H - height) + 'px';
        } else {
          cx -= dx / scale; cy -= dy / scale; draw();
        }
      }
      drag.lastX = event.clientX; drag.lastY = event.clientY;
      return;
    }
    if (event.pointerType !== 'mouse' || motion.matches) return;
    // A stable center and pause over links/pieces make items easy to select.
    var interactive = event.target.closest('button, a, .collage-sticker');
    vx = interactive ? 0 : edgeSpeed(event.clientX, viewport.clientWidth);
    vy = interactive ? 0 : edgeSpeed(event.clientY, viewport.clientHeight);
    animatePan();
  });
  viewport.addEventListener('pointerleave', function () { if (!drag) { vx = 0; vy = 0; } });
  viewport.addEventListener('pointerdown', function (event) {
    if (!ready || dialog.open) return;
    var sticker = event.target.closest('.collage-sticker');
    if (sticker && event.button === 0) {
      if (sticker.classList.contains('collage-butterfly-flying')) return;
      event.preventDefault();
      stopMovement();
      drag = { id: event.pointerId, sticker: sticker, left: parseFloat(sticker.style.left), top: parseFloat(sticker.style.top), x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, moved: false };
      sticker.classList.add('is-dragging');
      sticker.style.zIndex = '30';
      viewport.setPointerCapture(event.pointerId);
      return;
    }
    if (event.pointerType === 'touch' || event.pointerType === 'pen') {
      stopMovement();
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, lastY: event.clientY, moved: false };
      var item = event.target.closest('.collage-item');
      if (item) item.classList.add('is-touching');
    }
  });
  function finishDrag(event) {
    world.querySelectorAll('.is-touching').forEach(function (item) { item.classList.remove('is-touching'); });
    if (!drag || event.pointerId !== drag.id) return;
    if (drag.sticker) drag.sticker.classList.remove('is-dragging');
    suppressClick = drag.moved;
    var tappedButterfly = !drag.moved && event.type === 'pointerup' && drag.sticker && drag.sticker.hasAttribute('data-collage-butterfly');
    drag = null;
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    if (tappedButterfly) flyButterfly();
    // Only suppress the click belonging to this swipe.
    setTimeout(function () { suppressClick = false; }, 0);
  }
  viewport.addEventListener('pointerup', finishDrag);
  viewport.addEventListener('pointercancel', finishDrag);
  viewport.addEventListener('click', function (event) {
    if (suppressClick && event.detail !== 0) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  viewport.addEventListener('wheel', function (event) {
    if (!ready || dialog.open || event.ctrlKey) return;
    if (drag) { event.preventDefault(); return; }
    event.preventDefault(); stopMovement();
    cx += event.deltaX / scale; cy += event.deltaY / scale; draw();
  }, { passive: false });
  window.addEventListener('keydown', function (event) {
    if (dialog.open || !ready || event.altKey || event.ctrlKey || event.metaKey) return;
    if (drag) { if (event.key.startsWith('Arrow')) event.preventDefault(); return; }
    if (event.key.startsWith('Arrow')) { event.preventDefault(); vx = 0; vy = 0; keys.add(event.key); animatePan(); }
    if (event.key === 'Home' || event.key === 'Escape') { event.preventDefault(); stopMovement(); cx = 1181; cy = 847; draw(); }
  });
  window.addEventListener('keyup', function (event) { keys.delete(event.key); });
  window.addEventListener('blur', stopMovement);
  window.addEventListener('blur', function () { if (drag) finishDrag({ pointerId: drag.id }); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stopMovement(); });
  world.addEventListener('focusin', function (event) {
    if (!ready || dialog.open) return;
    var item = event.target.closest('.motion-item');
    if (!item) return;
    var r = event.target.getBoundingClientRect();
    if (r.left < 12 || r.top < 12 || r.right > innerWidth - 12 || r.bottom > innerHeight - 12) {
      cx = parseFloat(item.style.left) + parseFloat(item.style.width) / 2;
      cy = parseFloat(item.style.top) + parseFloat(item.style.height) / 2;
      stopMovement(); draw();
    }
  });

  var butterfly = world.querySelector('[data-collage-butterfly]');
  var butterflyFlying = false;
  async function flyButterfly() {
    if (!ready || dialog.open || butterflyFlying) return;
    butterflyFlying = true;
    stopMovement();
    var image = butterfly.querySelector('img');
    var rect = image.getBoundingClientRect();
    var art = butterfly.querySelector('.collage-art');
    var width = parseFloat(art.style.width) * scale;
    var height = parseFloat(art.style.height) * scale;
    var flyer = image.cloneNode(true);
    flyer.alt = '';
    flyer.setAttribute('aria-hidden', 'true');
    Object.assign(flyer.style, {
      position: 'fixed', left: rect.left + (rect.width - width) / 2 + 'px',
      top: rect.top + (rect.height - height) / 2 + 'px', width: width + 'px', height: height + 'px',
      objectFit: 'contain', pointerEvents: 'none', zIndex: '1000', filter: 'drop-shadow(2px 2px 3px #0005)'
    });
    document.documentElement.appendChild(flyer);
    butterfly.classList.add('collage-butterfly-flying');
    try {
      var startX = rect.left + rect.width / 2;
      var startY = rect.top + rect.height / 2;
      function point(x, y) {
        return { x: 16 + width / 2 + Math.max(0, innerWidth - width - 32) * x,
          y: 16 + height / 2 + Math.max(0, innerHeight - height - 32) * y };
      }
      // Connected Bézier curves make a smooth lap around the viewport, then exit above it.
      var curves = [
        [point(.6, .1), point(.88, .14), point(.78, .35)],
        [point(.68, .56), point(.87, .8), point(.65, .76)],
        [point(.43, .72), point(.13, .79), point(.2, .58)],
        [point(.27, .37), point(.14, .17), point(.36, .25)],
        [point(.58, .33), point(.76, .11), point(.73, .27)],
        [point(.7, .43), point(.63, -.05), { x: innerWidth * .6, y: -height - 60 }]
      ];
      var frames = [{ transform: 'translate(0,0) rotate(-24.22deg)', opacity: 1, offset: 0 }];
      var previous = { x: startX, y: startY };
      curves.forEach(function (curve, segment) {
        for (var step = 1; step <= 18; step++) {
          var t = step / 18, u = 1 - t;
          var x = u * u * u * previous.x + 3 * u * u * t * curve[0].x + 3 * u * t * t * curve[1].x + t * t * t * curve[2].x;
          var y = u * u * u * previous.y + 3 * u * u * t * curve[0].y + 3 * u * t * t * curve[1].y + t * t * t * curve[2].y;
          var progress = (segment + t) / curves.length;
          var flap = .72 + .28 * Math.cos(progress * Math.PI * 28);
          var tilt = -15 + 18 * Math.sin(progress * Math.PI * 8);
          frames.push({ transform: 'translate(' + (x - startX) + 'px,' + (y - startY) + 'px) rotate(' + tilt + 'deg) scaleX(' + flap + ')',
            opacity: progress < .94 ? 1 : (1 - progress) / .06, offset: progress });
        }
        previous = curve[2];
      });
      if (motion.matches) frames = [{ opacity: 1 }, { opacity: 0 }];
      await flyer.animate(frames, { duration: motion.matches ? 160 : 4600, easing: 'linear', fill: 'forwards' }).finished;
    } catch (error) {
      // An interrupted flight must always restore the draggable original.
    } finally {
      flyer.remove(); butterfly.classList.remove('collage-butterfly-flying'); butterflyFlying = false;
    }
  }
  butterfly.addEventListener('click', flyButterfly);

  world.querySelectorAll('.collage-project').forEach(function (item) {
    item.addEventListener('click', function () {
      if (!ready || suppressClick) return;
      stopMovement(); opener = item;
      heading.textContent = item.dataset.title;
      var media = document.createElement(item.dataset.media === 'video' ? 'video' : 'img');
      media.src = item.dataset.source;
      if (media.tagName === 'VIDEO') { media.controls = true; media.loop = true; media.muted = true; media.playsInline = true; }
      else media.alt = item.dataset.title;
      mediaHost.replaceChildren(media);
      world.querySelectorAll('video').forEach(function (video) { video.pause(); });
      dialog.showModal(); closeButton.focus({ preventScroll: true });
      if (media.tagName === 'VIDEO') media.play().catch(function () {});
    });
  });
  function closeViewer() { dialog.close(); }
  closeButton.addEventListener('click', closeViewer);
  var backdropDown = false;
  function outside(event) {
    var r = dialog.getBoundingClientRect();
    return event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom;
  }
  dialog.addEventListener('pointerdown', function (event) { backdropDown = outside(event); });
  dialog.addEventListener('click', function (event) { if (backdropDown && outside(event)) closeViewer(); backdropDown = false; });
  dialog.addEventListener('close', function () {
    // A native close event can arrive after a rapid reopen; keep the new piece intact.
    if (dialog.open) return;
    var video = mediaHost.querySelector('video'); if (video) video.pause();
    mediaHost.replaceChildren(); stopMovement();
    if (opener) opener.focus({ preventScroll: true });
    if (!motion.matches) visibleVideos.forEach(function (video) { video.play().catch(function () {}); });
  });

  var videoObserver = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) visibleVideos.add(entry.target);
      else visibleVideos.delete(entry.target);
      if (entry.isIntersecting && !motion.matches && ready && !dialog.open) entry.target.play().catch(function () {});
      else entry.target.pause();
    });
  }) : null;
  world.querySelectorAll('video').forEach(function (video) { if (videoObserver) videoObserver.observe(video); });
  function settle() {
    if (ready) return;
    intros.forEach(function (animation) { animation.cancel(); });
    items.forEach(function (item) { item.style.removeProperty('transform'); });
    ready = true; world.inert = false;
    document.body.classList.remove('is-gathering'); document.body.classList.add('is-ready');
    status.textContent = 'Collage ready. Explore with your cursor, arrow keys, or swipe. Select a larger piece to enlarge it.';
    world.querySelectorAll('video').forEach(function (video) {
      if (motion.matches || videoObserver && !visibleVideos.has(video)) video.pause();
      else video.play().catch(function () {});
    });
  }
  async function begin() {
    world.inert = true;
    if (motion.matches) { settle(); return; }
    // Lay out the pile synchronously so the first visible frame is centered,
    // including the navigation and logo, even while images are downloading.
    var starts = items.map(function (item, index) {
      var x = parseFloat(item.style.left), y = parseFloat(item.style.top);
      var w = parseFloat(item.style.width), h = parseFloat(item.style.height);
      var tiny = Math.min(.6, 190 / Math.max(w, h));
      var dx = cx - x - w / 2 + (index % 5 - 2) * 7;
      var dy = cy - y - h / 2 + (index % 7 - 3) * 5;
      var transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(' + (index % 9 - 4) * 5 + 'deg) scale(' + tiny + ')';
      item.style.transform = transform;
      return transform;
    });
    document.body.classList.add('is-gathering');
    var images = Array.from(world.querySelectorAll('img'));
    await Promise.race([
      Promise.allSettled(images.map(function (image) { return image.decode().catch(function () {}); })),
      new Promise(function (resolve) { setTimeout(resolve, 1200); })
    ]);
    if (ready) return;
    intros = items.map(function (item, index) {
      return item.animate([
        { transform: starts[index], offset: 0 },
        { transform: starts[index], offset: .23 },
        { transform: 'translate(0,0) rotate(0deg) scale(1)', offset: 1 }
      ], { duration: 2050, delay: index * 8, easing: 'cubic-bezier(.22,.7,.2,1)', fill: 'both' });
    });
    await Promise.allSettled(intros.map(function (animation) { return animation.finished; }));
    settle();
  }
  motion.addEventListener('change', function () {
    if (motion.matches) {
      stopMovement(); settle();
      world.querySelectorAll('video').forEach(function (video) { video.pause(); });
    } else if (ready && !dialog.open) visibleVideos.forEach(function (video) { video.play().catch(function () {}); });
  });
  begin();
})();
