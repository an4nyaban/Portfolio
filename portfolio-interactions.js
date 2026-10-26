(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Native image cursors work over both interactive and noninteractive content.
  ['Assets/scissors_closed_cursor.png', 'Assets/scissors_open_cursor.png'].forEach(function (src) {
    var cursor = new Image();
    cursor.src = src;
  });
  function setScissorsPressed(event) {
    if (event.pointerType === 'touch') return;
    document.documentElement.classList.toggle('scissors-pressed', event.buttons !== 0);
  }
  function resetScissors() { document.documentElement.classList.remove('scissors-pressed'); }
  window.addEventListener('pointerdown', setScissorsPressed, true);
  window.addEventListener('pointerup', setScissorsPressed, true);
  window.addEventListener('pointermove', setScissorsPressed, true);
  window.addEventListener('pointercancel', resetScissors, true);
  window.addEventListener('blur', resetScissors);
  window.addEventListener('pagehide', resetScissors);
  document.addEventListener('visibilitychange', function () { if (document.hidden) resetScissors(); });
  if (document.querySelector('.case-main-nav')) {
    function sizeMainNav() {
      document.documentElement.style.setProperty('--case-nav-scale', window.innerWidth / 1440);
    }
    sizeMainNav(); window.addEventListener('resize', sizeMainNav);
  }
  function turn(element, index) {
    element.classList.add('collage-turn');
    element.style.setProperty('--hover-turn', (index % 2 ? -8 : 8) + 'deg');
  }
  // Keep paper scraps and their labels on a single rotating surface.
  document.querySelectorAll('.site-footer').forEach(function (footer) {
    Array.from(footer.children).forEach(function (paper) {
      if (!paper.querySelector('img.paper')) return;
      var label = paper.nextElementSibling;
      if (!label || !label.querySelector('.contact-link')) return;
      var group = document.createElement('div');
      group.className = 'contact-paper-group';
      var left = parseFloat(paper.style.getPropertyValue('--l'));
      var top = parseFloat(paper.style.getPropertyValue('--t'));
      group.style.cssText = 'position:absolute;left:' + left + 'px;top:' + top + 'px;width:' + paper.style.getPropertyValue('--w') + ';height:' + paper.style.getPropertyValue('--h');
      footer.insertBefore(group, paper);
      [paper, label].forEach(function (piece) {
        piece.style.setProperty('--l', (parseFloat(piece.style.getPropertyValue('--l')) - left) + 'px');
        piece.style.setProperty('--t', (parseFloat(piece.style.getPropertyValue('--t')) - top) + 'px');
        group.appendChild(piece);
      });
    });
    // Placeful’s original tape also needs its wording attached to it.
    var wording = footer.querySelector(':scope > .footer-tape-text');
    if (wording) {
      var tape = wording.previousElementSibling;
      if (tape && tape.querySelector('img[src$="blue_tape.png"]')) {
        var group = document.createElement('div');
        group.className = 'contact-paper-group';
        group.style.cssText = 'position:absolute;left:0;top:0;width:480px;height:300px;transform-origin:240px 235px';
        footer.insertBefore(group, tape); group.append(tape, wording);
      }
    }
    footer.querySelectorAll(':scope > .sk, :scope > .contact-paper-group, :scope > .finergy-contact-tape').forEach(turn);
  });

  var caseContact = document.querySelector('.cs-footer-band');
  if (caseContact) {
    function sizeCaseContact() {
      var scale = Math.min(.65, Math.max(0, (window.innerWidth - 32) / 1440));
      caseContact.style.setProperty('--case-contact-scale', scale);
      caseContact.style.height = 523 * scale + 'px';
      caseContact.querySelector('.cs-footer-anchor').style.width = 1440 * scale + 'px';
    }
    sizeCaseContact(); window.addEventListener('resize', sizeCaseContact);
  }
  var about = document.body.classList.contains('about-page');
  var elements = Array.from(document.querySelectorAll('.site-footer > *'));
  if (document.body.classList.contains('home-page')) {
    document.querySelectorAll('.home-hero-art > *, .home-work-marker > *, .home-collage > *').forEach(function (element) {
      if (element.matches('a')) elements.push.apply(elements, Array.from(element.children));
      else elements.push(element);
    });
  }
  document.querySelectorAll('.coming-soon-main > *').forEach(function (element) { elements.push(element); });
  if (about) elements.push.apply(elements, Array.from(document.querySelectorAll('.about-page .page > .sk, .about-page .page > .photo-frame, .about-page .page > .blurb, .about-page .page > .blurb-accent, .about-page .page > .label-plain, .about-page .page > .label-italic, .about-page .page > .exp-outer, .about-page .page > .detail-reveal')));
  if (about) document.querySelectorAll('.about-hero-collage > *, .about-hero-intro > *').forEach(function (element) { elements.push(element); });
  elements = Array.from(new Set(elements));
  function sizeFooter() {
    var scale = Math.min(.65, Math.max(0, (window.innerWidth - 32) / 1440));
    var band = document.querySelector('.home-contact-band');
    document.documentElement.style.setProperty('--about-contact-scale', scale);
    band.style.height = 523 * scale + 'px';
    band.querySelector('.home-contact-anchor').style.width = 1440 * scale + 'px';
  }
  if (about) { sizeFooter(); window.addEventListener('resize', sizeFooter); }

  var observer = !reduced.matches && 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      // Keep observing so both upward and downward returns replay the entrance.
      entry.target.classList.toggle('is-revealed', entry.isIntersecting);
    });
  }, { threshold: 0, rootMargin: '0px' }) : null;
  elements.forEach(function (element, index) {
    var image = element.querySelector('img');
    var garden = about && element.parentElement.matches('.page') && image && /metro_24|piano\.png/.test(image.getAttribute('src'));
    var aboutArt = about && element.parentElement.matches('.page') && !element.matches('.blurb, .blurb-accent');
    if (aboutArt && !garden) turn(element, index);
    if (garden) {
      element.classList.add('garden-fade');
      element.addEventListener('pointermove', function (event) {
        if (reduced.matches || event.pointerType === 'touch') return;
        var rect = element.getBoundingClientRect();
        element.style.setProperty('--garden-x', ((event.clientX - rect.left) / rect.width * 100) + '%');
        element.style.setProperty('--garden-y', ((event.clientY - rect.top) / rect.height * 100) + '%');
        element.style.setProperty('--garden-fade-alpha', '.08');
      });
      element.addEventListener('pointerleave', function () { element.style.setProperty('--garden-fade-alpha', '1'); });
    }
    if (element.hasAttribute('data-album-cover')) element.style.setProperty('--hover-turn', (index % 2 ? -1.5 : 1.5) + 'deg');
    if (element.hasAttribute('data-fashion-photo')) element.style.setProperty('--hover-turn', (index % 2 ? -3 : 3) + 'deg');
    if (element.matches('.exp-outer')) element.style.setProperty('--hover-turn', '2deg');
    if (!observer) return;
    element.classList.add('scroll-reveal');
    if (garden) element.classList.add('reveal-fade');
    if (element.matches('.blurb-accent')) element.style.setProperty('--reveal-delay', '180ms');
    if (element.matches('.exp-outer')) element.classList.add('experience-assembly');
    // Scatter small pieces within each region, while keeping the text first.
    if (element.matches('.sk, .about-detail-piece') && !garden) element.style.setProperty('--reveal-delay', (index % 4 * 100) + 'ms');
    observer.observe(element);
  });
  document.querySelectorAll('.about-hero-collage > .sk').forEach(turn);
  var descriptionCard = document.querySelector('.about-page .about-hero-note');
  if (descriptionCard) {
    descriptionCard.classList.add('collage-turn');
    descriptionCard.style.setProperty('--hover-turn', '2deg');
  }
  var greeting = document.querySelector('.about-page .about-name-label');
  if (greeting) {
    greeting.classList.add('collage-turn');
    greeting.style.setProperty('--hover-turn', '-2deg');
  }
  document.querySelectorAll('.about-page img[src="Assets/cd.png"]').forEach(function (image) {
    var cd = image.closest('.sk');
    // Spin the image independently of its scroll entrance and collage position.
    cd.style.setProperty('--hover-turn', '0deg');
    var spin = image.animate([{ rotate: '0deg' }, { rotate: '360deg' }], {
      duration: 2200, iterations: Infinity, easing: 'linear'
    });
    spin.pause();
    cd.addEventListener('pointerenter', function () { if (!reduced.matches) spin.play(); });
    cd.addEventListener('pointerleave', function () { spin.pause(); });
    reduced.addEventListener('change', function () { if (reduced.matches) spin.pause(); });
  });
  reduced.addEventListener('change', function () {
    if (reduced.matches && observer) {
      observer.disconnect(); elements.forEach(function (element) { element.classList.add('is-revealed'); });
    } else if (observer) { elements.forEach(function (element) { observer.observe(element); }); }
  });
})();
