(function(){
  // Navbar: scroll state + mobile toggle
  var navbar = document.getElementById('navbar');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks){
    navToggle.setAttribute('aria-controls', navLinks.id);
    navToggle.setAttribute('aria-label', 'Open navigation menu');
  }

  function onScroll(){
    if (window.scrollY > 40){ navbar.classList.add('scrolled'); }
    else{ navbar.classList.remove('scrolled'); }
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  function setMenu(open){
    if (!navToggle || !navLinks) return;
    navLinks.classList.toggle('open', open);
    navToggle.classList.toggle('open', open);
    document.body.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  }
  if (navToggle && navLinks) navToggle.addEventListener('click', function(){
    setMenu(!navLinks.classList.contains('open'));
  });
  if (navLinks) navLinks.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      setMenu(false);
    });
  });
  if (navToggle && navLinks){
    var menuBackdrop = document.createElement('button');
    menuBackdrop.className = 'nav-backdrop';
    menuBackdrop.type = 'button';
    menuBackdrop.setAttribute('aria-label', 'Close navigation menu');
    menuBackdrop.addEventListener('click', function(){ setMenu(false); });
    document.body.appendChild(menuBackdrop);

    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && navLinks.classList.contains('open')){
        setMenu(false);
        navToggle.focus();
      }
      if (e.key === 'Tab' && navLinks.classList.contains('open')){
        var links = navLinks.querySelectorAll('a[href]');
        var first = navToggle;
        var last = links[links.length - 1];
        if (e.shiftKey && document.activeElement === first){
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last){
          e.preventDefault();
          first.focus();
        }
      }
    });
    window.addEventListener('resize', function(){
      if (window.innerWidth > 760) setMenu(false);
    }, { passive:true });
  }

  // Falling petals
  var container = document.getElementById('petals');
  var count = window.innerWidth < 700 ? 8 : 16;
  for (var i=0;i<count;i++){
    var p = document.createElement('div');
    p.className = 'petal';
    var left = Math.random()*100;
    var duration = 9 + Math.random()*8;
    var swayDuration = 3 + Math.random()*2;
    var delay = Math.random()*-14;
    p.style.left = left + 'vw';
    p.style.animationDuration = duration + 's, ' + swayDuration + 's';
    p.style.animationDelay = delay + 's, ' + (Math.random()*-3) + 's';
    p.style.opacity = (0.4 + Math.random()*0.4).toFixed(2);
    p.style.transform = 'scale(' + (0.6 + Math.random()*0.8).toFixed(2) + ')';
    container.appendChild(p);
  }

  // Scroll reveal
  var targets = document.querySelectorAll('.reveal, .reveal-stagger');
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    targets.forEach(function(t){ io.observe(t); });
  } else {
    targets.forEach(function(t){ t.classList.add('in'); });
  }

  // RSVP -> submit to Google Forms only after the network request actually succeeds.
  // This prevents a fake "submitted" message when the device is offline.
  var form = document.getElementById('rsvpForm');
  if (form){
    var GOOGLE_FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLScKgmukumiAeGYxlWeavTM12hyguhsCW1Zr6BdQ4lU4sC-o7A/formResponse";
    var ENTRY = {
      name:    "entry.172896848",
      gender:  "entry.1809738655",
      email:   "entry.521871941",
      nic:     "entry.654908423",
      address: "entry.771401260",
      contact: "entry.1015370463"
    };

    var status = document.getElementById('rsvpStatus');
    var submitBtn = document.getElementById('rsvpSubmit');

    var setStatus = function(msg, cls){
      status.textContent = msg;
      status.className = 'rsvp-status' + (cls ? ' ' + cls : '');
    };

    form.addEventListener('submit', async function(e){
      e.preventDefault();
      if (!form.checkValidity()){
        form.reportValidity();
        return;
      }

      var values = {
        name: form.name.value.trim(),
        gender: form.gender.value || '',
        email: form.email.value.trim(),
        nic: form.nic.value.trim(),
        address: form.address.value.trim(),
        contact: form.contact.value.trim()
      };

      submitBtn.disabled = true;
      setStatus('Checking connection and submitting your registration…');

      var payload = new URLSearchParams();
      Object.keys(ENTRY).forEach(function(key){
        payload.append(ENTRY[key], values[key]);
      });

      var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timeout = controller ? setTimeout(function(){ controller.abort(); }, 12000) : null;

      try {
        // no-cors is required because Google Forms does not expose CORS response headers.
        // A successful fetch means the browser was able to send the request; an offline
        // browser/network failure rejects the promise and will NOT show a success message.
        await fetch(GOOGLE_FORM_ACTION, {
          method: 'POST',
          mode: 'no-cors',
          body: payload,
          signal: controller ? controller.signal : undefined
        });

        if (timeout) clearTimeout(timeout);
        setStatus('Thank you, ' + values.name + ' — your registration request was sent to the organizers.', 'ok');
        form.reset();
      } catch (error) {
        if (timeout) clearTimeout(timeout);
        setStatus('Your registration request could not be sent. Please check your internet connection and try again.', 'err');
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
})();
/* =========================================================
   ELYSIUM '26 — cinematic scroll / motion enhancements
   ========================================================= */
(function(){
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  // Scroll progress indicator
  var progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden','true');
  document.body.appendChild(progress);

  // Soft cursor light on desktop
  if (window.matchMedia('(pointer:fine)').matches){
    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden','true');
    document.body.appendChild(glow);
    var mx = -300, my = -300, gx = mx, gy = my;
    window.addEventListener('pointermove', function(e){ mx=e.clientX; my=e.clientY; }, {passive:true});
    function cursorLoop(){
      gx += (mx-gx)*0.11; gy += (my-gy)*0.11;
      glow.style.left = gx+'px'; glow.style.top = gy+'px';
      requestAnimationFrame(cursorLoop);
    }
    cursorLoop();
  }

  var ticking = false;
  function motion(){
    var scrollY = window.scrollY || window.pageYOffset;
    var doc = document.documentElement;
    var max = Math.max(1, doc.scrollHeight - window.innerHeight);
    progress.style.transform = 'scaleX(' + Math.min(1, scrollY/max) + ')';

    // Cinematic hero parallax. Keep movement subtle so text remains readable.
    var hero = document.querySelector('.hero');
    if (hero){
      var heroH = hero.offsetHeight || window.innerHeight;
      var amount = Math.min(scrollY, heroH);
      var backdrop = hero.querySelector('.hero-backdrop');
      var ornaments = hero.querySelectorAll('.hero-ornament');
      var glowLayer = hero.querySelector('.hero-glow');
      if (backdrop) backdrop.style.transform = 'translate3d(0,'+(amount*0.08)+'px,0) scale('+(1+amount*0.00008)+')';
      ornaments.forEach(function(el){ el.style.transform = (el.classList.contains('hero-ornament-right')?'scaleX(-1) ':'')+'translate3d(0,'+(amount*0.12)+'px,0)'; });
      if (glowLayer) glowLayer.style.transform = 'translate3d(-50%,'+(amount*0.05)+'px,0)';
    }

    // Gentle depth shift for the fixed starfield.
    var stars = document.querySelector('.stars');
    if (stars) stars.style.transform = 'translate3d(0,'+(scrollY*0.025)+'px,0)';
    ticking = false;
  }
  window.addEventListener('scroll', function(){
    if (!ticking){ requestAnimationFrame(motion); ticking=true; }
  }, {passive:true});
  motion();

  // Automatically animate common content blocks even when a page was not manually tagged.
  var autoReveal = document.querySelectorAll('.page-hero + section, footer, .explore-card, .venue-card, .rsvp-card, .t-row');
  if ('IntersectionObserver' in window){
    var autoIO = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add('in');
          autoIO.unobserve(entry.target);
        }
      });
    }, {threshold:0.12, rootMargin:'0px 0px -7% 0px'});
    autoReveal.forEach(function(el){
      if (!el.classList.contains('reveal') && !el.classList.contains('reveal-stagger')){
        el.classList.add('reveal');
      }
      autoIO.observe(el);
    });
  }

  // Add a tiny tilt effect to premium cards on desktop.
  if (window.matchMedia('(pointer:fine)').matches){
    document.querySelectorAll('.explore-card,.venue-card,.rsvp-card').forEach(function(card){
      card.addEventListener('pointermove', function(e){
        var r=card.getBoundingClientRect();
        var x=(e.clientX-r.left)/r.width-.5;
        var y=(e.clientY-r.top)/r.height-.5;
        card.style.transform='perspective(900px) rotateX('+(-y*2.2)+'deg) rotateY('+(x*2.2)+'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', function(){ card.style.transform=''; });
    });
  }
})();
