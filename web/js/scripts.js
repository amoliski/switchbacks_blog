
(function(){
function nativeSmoothScrollTo(o){
  if(o.getBoundingClientRect){
    window.scroll({behavior:"smooth",left:0,top:o.getBoundingClientRect().top+window.pageYOffset})
  } else if(typeof o === "number"){
    window.scroll({behavior:"smooth",left:0,top:o})
  }
}
function smoothScrollTo(o,t){
  var e=document.scrollingElement||document.documentElement,l=e.scrollTop,n=o-l,r=+new Date;
  !function c(s){var i,m,a,u=+new Date-r;e.scrollTop=parseInt((i=u,m=l,a=n,(i/=t/2)<1?a/2*i*i+m:-a/2*(--i*(i-2)-1)+m)),u<t?requestAnimationFrame(c):e.scrollTop=o}()
}
function scrollToElem(o){if(o){var t=document.querySelector(o);t&&("scrollBehavior"in document.documentElement.style?nativeSmoothScrollTo(t):smoothScrollTo(t.offsetTop,600))}}
function scrollToY(o){ if ("scrollBehavior"in document.documentElement.style) {nativeSmoothScrollTo(o);} else {smoothScrollTo(o, 600);}}

function scroll_to_top(e){
  if(e){
    e.preventDefault();
  }
  scrollToY(0);
  return false;
}

function scroll_to_id(element){
  let height = document.body.scrollHeight || 1;
  let el = document.getElementById(element)
  if(el){
    smoothScrollTo(document.getElementById(element).offsetTop, height/8)
  }

  return false;
}

window.scroll_to_top = scroll_to_top;
window.scroll_to_id = scroll_to_id;
window.smoothScrollTo = smoothScrollTo;

function transition(fn){
  document.addEventListener('swup:animationInStart', function(){fn(arguments)});
}

function ready(fn) {
  document.addEventListener('swup:contentReplaced', fn);
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function apply_animations(){
  document.querySelectorAll('.slide_transition').forEach(function(e){
    e.classList.add('slide_in');
    if(e.attributes['data-delay']){
      e.style.animationDelay = e.attributes['data-delay'].value;
      e.style.webkitAnimationDelay = e.attributes['data-delay'].value;
    }
  });
  document.querySelectorAll('.fade_transition').forEach(function(e){
    e.classList.add('fade_in');
    if(e.attributes['data-delay']){
      e.style.webkitAnimationDelay = e.attributes['data-delay'].value;
      e.style.animationDelay = e.attributes['data-delay'].value;
    }
  });
}

transition(apply_animations);

function getRelativeCoordinates (event, referenceElement) {
  const position = {
    x: event.pageX,
    y: event.pageY
  };
  const offset = {
    left: referenceElement.offsetLeft,
    top: referenceElement.offsetTop
  };

  let reference = referenceElement.offsetParent;

  while(reference){
    offset.left += reference.offsetLeft;
    offset.top += reference.offsetTop;
    reference = reference.offsetParent;
  }

  return {
    x: position.x - offset.left,
    y: position.y - offset.top,
  };

}

function scroll_hider(){
  let nav = document.getElementById('top');

  function hide_nav() {
    nav.classList.add('scroll_hide')
  }

  function show_nav() {
    nav.classList.remove('scroll_hide')
  }

  window.addEventListener('blur', function(){
    if(document.querySelectorAll('iframe').length > 0){
      console.log(arguments);
      show_nav();
    }
  }, true);


  let last_scroll_pos = window.scrollY;
  document.addEventListener('scroll', function (e) {
    const pos = window.scrollY;
    if (pos === 0) {
      show_nav();
      return;
    }
    if (pos > last_scroll_pos) {
      hide_nav();
    } else {
      show_nav();
    }
    last_scroll_pos = pos;
  })
}
scroll_hider();

/** Analytics **/
(function(){
  let set_up_ga = function(){
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'UA-142131190-1');
  };
  let register_hit = function(){
    if(window['ga']){
      window['ga']('set', 'page', window.location.pathname);
      window['ga']('send', 'pageview');
    }
  };
  ready(set_up_ga);
  document.addEventListener('swup:contentReplaced', register_hit);
})();

/** Articles page **/
(function() {
  let posts = [];
  let categories = {};
  let article_count = 0;
  let active_category = "All";
  let active_subcategory = 'All';
  let loaded=false;


  let month_names = {
    '01': "January",
    '02': "February",
    '03': "March",
    '04': "April",
    '05': "May",
    '06': "June",
    '07': "July",
    '08': "August",
    '09': "September",
    '10': "October",
    '11': "November",
    '12': "December",
  };
  let difficulty_sort = {
    'Easy': 1,
    'Moderate': 2,
    'Difficult': 3,
    'None': 4,
  };

  function add_to_category_path(element, path) {
    let active = categories;
    for (let i = 0; i < path.length - 1; i++) {
      let path_el = path[i];
      if (!(path_el in active)) {
        active[path_el] = {};
      }
      active = active[path_el]
    }
    let last_el = path[path.length - 1];
    if (!(last_el in active)) {
      active[last_el] = []
    }
    active[last_el].push(element);
  }

  function createElementFromHTML(htmlString) {
    let div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild;
  }

  function create_article(data, fade_in, hide_location) {
    let location = data.location;
    let locationAbbreviation = data.locationAbbreviation;
    let classes = ['not_yet', 'article', fade_in?'transparent':''].join(' ');

    let template = (
      '<a href="/'+data.url+'" class="'+classes+'">'+
      '<div class="article_image small hover_border_tight" style="background-color: #001a11; background-image:url('+ data.thumbnail_s +');"></div>'+
      '<div class="article_image medium hover_border_tight" style="background-color: #001a11; background-image:url('+ data.thumbnail_w +');"></div>'+
      '<div class="article_image large hover_border_tight" style="background-color: #001a11; background-image:url('+ data.thumbnail_m +');"></div>'+
      '<div class="articleData">'+
      '<h3 class="tighter hover_color"> '+ data.title +' </h3>'+
        ((location && !hide_location) ?'<div class="caption"><div class="token">'+locationAbbreviation+'</div>'+ location +'</div>':''+
      '<p class="article_description">'+ data.description +'</p>'+
      '</div>'+
      '</a>')
    );
    var element =  createElementFromHTML(template);
    return element;
  }

  function clear_articles() {
    document.getElementById('posts').innerHTML = "";
  }

  function get_category_title(name, fade_in) {
    let classes = ['span_full not_yet', fade_in ? 'transparent' : ''].join(' ');
    let template = (
      "<div class='"+classes+"'>" +
      "<h3 class='section_heading'>" + name + "</h3>" +
      "<div class='section_break'/>" +
      "</div>"
    );
    return createElementFromHTML(template);
  }

  function get_subcategory_title(name) {
    let template = (
      "<div class='span_full not_yet transparent'>" +
      "<h4 class='subsection_heading'>" + name + "</h4>" +
      "</div>"
    );
    return createElementFromHTML(template);
  }

  function add_articles(articles, fade_in, hide_location) {
    let posts_container = document.getElementById('posts');
    let all = createElementFromHTML("<div class='section_container article_list medium_grid'></div>");
    posts_container.append(all);

    for (let i = 0; i < articles.length; i++) {
      all.append(
        create_article(
          articles[i],
          fade_in,
          hide_location
        )
      );
    }
  }

  function render_all(fade_in) {
    let posts = document.getElementById('posts');

    let category = categories['All'];
    update_submenu("All", []);
    article_count = 0;
    for (let i = 0; i < category.length; i++) {
      article_count ++;
      posts.append(
        create_article(
          category[i],
          fade_in,
          false
        )
      );
    }
  }

  function render_dates(fade_in) {

    let posts = document.getElementById('posts');
    let category = categories['Date'];

    let years = Object.keys(category);

    // Reverse chronological
    years.sort().reverse();

    update_submenu("Year", years);

    for (let i = 0; i < years.length; i++) {
      let year = category[years[i]];
      if (active_subcategory !== "All" && active_subcategory !== String(years[i])) {
        continue;
      }
      let months = Object.keys(year);
      months.sort().reverse();

      for (let j = 0; j < months.length; j++) {
        let category_name = month_names[months[j]] + " " + years[i];
        posts.append(get_category_title(category_name, fade_in));
        let articles = year[months[j]];
        for (let k = 0; k < articles.length; k++) {
          posts.append(
            create_article(
              articles[k],
              fade_in,
              false
            )
          );
        }
      }
    }
  }

  function render_regions(fade_in) {
    let category = categories['Region'];
    // ['Northeast', 'Southwest', ...]
    let regions = Object.keys(category);
    // Alphasort regions
    regions.sort();

    //update_submenu("Region", regions);

    for (let i = 0; i < regions.length; i++) {
      let region_name = regions[i];
      if (active_subcategory !== "All" && active_subcategory !== region_name) {
        continue;
      }
      let region = category[region_name];
      add_category_title(region_name, fade_in);
      add_articles(region, fade_in);
    }
  }

  function render_difficulty(fade_in) {
    let posts = document.getElementById('posts');
    let category = categories['Difficulty'];
    // ['Easy', 'Difficult', ...]
    let difficulties = Object.keys(category);
    // Sort Difficulties
    difficulties.sort(function (a, b) {
      return (difficulty_sort[a] || 10) - (difficulty_sort[b] || 10)
    });

    article_count = 0;

    update_submenu("Difficulty", difficulties);

    for (let j = 0; j < difficulties.length; j++) {
      let difficulty_name = difficulties[j];
      if (active_subcategory !== "All" && active_subcategory !== difficulty_name) {
        continue;
      }
      posts.append(get_category_title(difficulty_name, fade_in));

      let articles = category[difficulty_name];
      for (let k = 0; k < articles.length; k++) {
        posts.append(
          create_article(
            articles[k],
            fade_in,
            false
          )
        );
        article_count += 1;
      }
    }
  }

  function render_parks(fade_in) {
    let posts = document.getElementById('posts');
    let category = categories['Park'];

    let parks = Object.keys(category);
    parks.sort();

    update_submenu("Park Type", parks);

    for (let i = 0; i < parks.length; i++) {
      let park_type_name = parks[i];
      if (active_subcategory !== "All" && active_subcategory !== park_type_name) {
        continue;
      }

      let park_type = category[park_type_name];;
      posts.append(get_category_title(park_type_name, fade_in));

      let park_names = Object.keys(park_type);
      park_names.sort();

      for (let j = 0; j < park_names.length; j++) {
        let articles = park_type[park_names[j]];
        for (let k = 0; k < articles.length; k++) {
          posts.append(
            create_article(
              articles[k],
              fade_in,
              false
            )
          );
        }
      }
    }
  }

  function load_next_chunk() {
    let lmb = document.querySelector('.load_more');
    if (lmb.classList) {
      lmb.classList.remove('hidden');
    }

    let next_chunk = document.querySelectorAll("#posts .transparent.not_yet");

    if(next_chunk.length < 12){
      document.querySelector('.load_more').style.display = 'none';
    }

    for(let e = 0; e < next_chunk.length && e < 12; e++){
      next_chunk[e].classList.remove('not_yet');
    }

    reveal_articles('#posts .transparent:not(.not_yet)');
  }

  function reveal_articles(selector) {
    let all_articles = Array.from(document.querySelectorAll(selector));

    let show_next_element = function (el) {
      if (el.length === 0) return;
      el[0].classList.remove('transparent');
      setTimeout(function () {
        show_next_element(el.slice(1))
      }, 70)
    };
    setTimeout(function () {
      show_next_element(all_articles)
    }, 20)
  }

  function render_active_category(fade_in) {
    let posts = document.getElementById('posts');
    clear_articles();
    article_count = 0;

      ({
        'Date': render_dates,
        'Region': render_regions,
        'Difficulty': render_difficulty,
        'Park': render_parks,
        'All': render_all,
      }[active_category] || function (){})(fade_in);
      let template = '<div class="load_more_bg"></div>';
      let more_button_container = createElementFromHTML(template);
      posts.append(more_button_container);

      template = ''+
      '<a class="primary_button scroll_to_top hov_fix" href="#top" style="margin: 0 10px;" onclick="return scroll_to_top(event)">'+
      '  <span>Back to top</span>'+
      '</a>';
      let scroll_to_top_button = createElementFromHTML(template);
      more_button_container.appendChild(scroll_to_top_button);

      template = ''+
        '<a class="primary_button load_more" style="margin: 0 10px;" href="javascript:void(0);">'+
        '  <span>Load More Posts</span>'+
        '</a>';
      let load_more_button = createElementFromHTML(template);
      load_more_button.addEventListener('click', load_next_chunk);
      more_button_container.appendChild(load_more_button);

    load_next_chunk();


  }

  function set_subcategory_button(subcategory) {
    let buttons = document
      .getElementById('trail_log_submenu')
      .querySelectorAll('button:not(#button_' + subcategory.replace(/[ !@#$%^&*()\-/\\]/g, "_") + ')');
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].classList.remove('active');
    }
    document
      .getElementById("button_" + subcategory.replace(/[ !@#$%^&*()\-/\\]/g, "_"))
      .classList
      .add('active');
  }

  let active_menu = null;

  function update_submenu(title, options) {
    let submenu = document.getElementById('trail_log_submenu');
    if (active_menu === title && submenu.children.length > 0) {
      return;
    }
    active_menu = title;
    submenu.innerHTML = "";

    if (title === 'All'){
      return;
    }

    let create_sub_button = function (sub_category) {
      let template = (
        '<button ' + (
          sub_category === active_subcategory ?
            'class="filter_option pill_button pill_button_ripple active"' :
            'class="filter_option pill_button pill_button_ripple"'
        ) +
        ' id="button_' + sub_category.replace(/[ !@#$%^&*()\-/\\]/g, "_") + '">' +
        sub_category +
        '<div class="ripple"></div></button>'
      );
      let button = createElementFromHTML(template);
      button.addEventListener('click', function (e) {
        set_subcategory_button(sub_category);
        active_subcategory = sub_category;
        render_active_category(true);
        position_ripple(button, e);
      });
      return button;
    };
    let submenu_header = (
      "<div class='wide'>" +
      "<h3 class='section_heading'> Filter By " + title + "</h3>" +
      "</div>"
    );
    submenu.append(createElementFromHTML(submenu_header))
    submenu.append(create_sub_button('All'));
    for (let p = 0; p < options.length; p++) {
      submenu.append(create_sub_button(options[p]));
    }
  }

  function position_ripple(button, event){
    let width = button.getClientRects()[0].width;
    let height = button.getClientRects()[0].height;
    let size = Math.max(width, height) * 2;
    let relco = getRelativeCoordinates(event, button);


    button.children[0].style.width = size + "px";
    button.children[0].style.height = size + "px";
    button.children[0].style.left = ((-1 * (size / 2)) + relco.x) + "px";
    button.children[0].style.top = ((-1 * (size / 2)) + relco.y) + "px";
  }

  function set_category_button(category) {
    let buttons = document
      .getElementById('trail_log_menu')
      .querySelectorAll('button:not(#button_' + category + ')');
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].classList.remove('active');
    }
    document.getElementById(category + '_button')
      .classList
      .add('active');
  }

  function create_button(category) {
    let template = (
      '<button  id="' + category + '_button"' + (category === active_category ?
        'class="filter_option active pill_button pill_button_ripple"' :
        'class="filter_option  pill_button pill_button_ripple"') +
      '>' +
      category +
      '<div class="ripple"></div></button>'
    );
    let button = createElementFromHTML(template);

    button.addEventListener('click', function (e) {
      set_category_button(category);
      active_subcategory = "All";
      active_category = category;
      position_ripple(button, e);


      render_active_category(true);

    });
    return button;
  }

  function create_filter_buttons() {
    const container = document.getElementById('trail_log_menu');
    const categories = ['All', 'Date', 'Difficulty', 'Park'];
    categories.forEach(function(e){
      container.appendChild(create_button(e));
    });
  }

  function process_articles() {
    for (let i = 0; i < posts.length; i++) {
      let post = posts[i];
      // Date
      let date = post.date.date.split(' ')[0].split('-');
      let year = date[0];
      let month = date[1];
      add_to_category_path(post, ['Date', year, month]);
      add_to_category_path(post, ['All'])

      // Region
      //let region = post.region || 'None';
      //add_to_category_path(post, ['Region', region])

      // Difficulty
      let difficulty = post.difficulty || 'None';
      add_to_category_path(post, ['Difficulty', difficulty]);

      //Park
      let park = post.location || "None";
      let type = post.type || "None";
      add_to_category_path(post, ['Park', type, park])
    }
  }

  function render(){
    create_filter_buttons();
    render_active_category(active_category, true);
  }

  ready(function (e) {
    if(window.location.pathname.split('/').slice(-1)[0] !== 'articles'){
      return;
    }
    if(!loaded){
      let xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/articles');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onload = function () {
        if (xhr.status !== 200) {
          console.log('XHR ERROR');
          return
        }
        posts = JSON.parse(xhr.responseText);
        process_articles();
        render();
        loaded = true;
      };
      xhr.send();
    }else{
      render();
    }
  });
})();

/**Captcha for contact form**/
ready(function(){
  if(window.location.pathname.split('/').slice(-1)[0] !== 'contact'){
    return;
  }
  document.querySelector('button[type=submit]').addEventListener('click', function(e) {
    //e.preventDefault();
    grecaptcha.ready(function() {
      grecaptcha.execute('6LeX-qkZAAAAAFtPcUmqD1lXrbYDRLaGG58P2e57', {action: 'submit'}).then(function(token) {
        // Add your logic to submit to your backend server here.
      });
    });
    //return false;
  });
});


/**Activate Youtube Videos**/
(function(){
  function init_youtube(container, video_list, settings){
    let show_controls = settings[0];
    let start_muted = settings[1];
    let autoplay = settings[2];
    let loop = settings[3];

    let player_settings = {
      autohide: 1,
      modestbranding: 1,
      rel: 0,
      controls: show_controls,
      disablekb: 1,
      iv_load_policy: 3
    };
    let currVid =  0; // Math.floor(Math.random() * video_list.length);
    let onPlayerReady = function(e){
      let tv = e.target;

      tv.cueVideoById(video_list[currVid][0], Number(video_list[currVid[1]] || 0) || 0);
      if(autoplay) {
        tv.playVideo();
      }
      if(start_muted){
        tv.mute();
      }
      tv.setPlaybackRate(Number(video_list[currVid[2]] || 1) || 1);
      let player = document.getElementById(container);
      let width = player.getBoundingClientRect().width;
      tv.setSize(width*.56, width);

    };
    let onPlayerStateChange = function(e){
      let tv = e.target;
      if(e.data === YT.PlayerState.PLAYING){
        tv.setPlaybackRate(Number(video_list[currVid][2] || 1) || 1);
        return;
      }
      if(
        e.data === YT.PlayerState.PAUSED ||
        e.data === YT.PlayerState.BUFFERING ||
        e.data === YT.PlayerState.CUED ||
        e.data === -1){
        return;
      }
      if(currVid === video_list.length -1 && !loop){
        return;
      }
      if(video_list.length > 1){
        currVid = (currVid + 1) % video_list.length;
        let data = {
          videoId: video_list[currVid][0],
          startSeconds:Number(video_list[currVid][1] || 0) || 0
        };
        tv.loadVideoById(data);
      }else{
        tv.seekTo(0);
      }


    };
    return new YT.Player(container, {
      events: {onReady: onPlayerReady, onStateChange: onPlayerStateChange},
      playerVars: player_settings,
      width: '100%'
    })
  }

  function init(){
    let yt_instances = [];
    let videos = document.querySelectorAll('.youtube_video');
    if(videos.length === 0){
      return;
    }

    if((typeof YT === "undefined") || !(YT) || !(YT.Player)){
      setTimeout(init, 100);
      return;
    }

    for(let i = 0; i < videos.length; i++){
      let video = videos[i];
      let video_list = video.getAttribute('data-videos')
        .split(';')
        .map(function(e){return e.split(',')})
        .filter(function(e){return e.length > 1});
      let container = video.getAttribute('data-id');
      let settings = video.getAttribute('data-settings')
        .split(',')
        .map(function(e){return Number(e)});
      yt_instances.push(init_youtube(container, video_list, settings));
    }

    function unload(){
      for(let i = 0; i < yt_instances.length; i++){
        yt_instances[i].destroy();
      }
      document.removeEventListener('swup:willReplaceContent', unload);
    }
    document.addEventListener('swup:willReplaceContent', unload);
  }

  ready(init)
})();

/**Hero Loader, font size switcher**/
(function(){
  let do_heroloader = function(){
    let placeholder = document.querySelector('.__article__ .loadingPlaceholder');
    let hero = document.querySelector('.__article__ .heroImage');

    const size_picker = document.querySelector('.__article__ .story .text-size-picker');
    const article = document.querySelector('.__article__ .story article');
    if(size_picker && article){

      size_picker.querySelector('.small_text').addEventListener('click', function(){
        article.classList.add('small_text');
        article.classList.remove('large_text');
      });
      size_picker.querySelector('.regular_text').addEventListener('click', function(){
        article.classList.remove('small_text');
        article.classList.remove('large_text');
      });
      size_picker.querySelector('.large_text').addEventListener('click', function(){
        article.classList.remove('small_text');
        article.classList.add('large_text');
      });
    }

    if(placeholder){
      hero.classList.add('transparent');
      setTimeout(function(){
        if(!placeholder) return;
        let style = placeholder.currentStyle || window.getComputedStyle(placeholder, false);
        let pbi = style.backgroundImage.slice(4, -1).replace(/"/g, "");
        let pimg = new Image();
        let ploaded = function() {
          placeholder.classList.add('fade_in');
        };
        pimg.onload = ploaded;
        pimg.src = pbi;
        if (pimg.complete) ploaded();
      }, 1)
    };

    if(hero){
      hero.classList.add('transparent');
      setTimeout(function(){
        if(!hero) return;
        let style = hero.currentStyle || window.getComputedStyle(hero, false);
        let bi = style.backgroundImage.slice(4, -1).replace(/"/g, "");
        let img = new Image();
        let loaded = function() {
          hero.classList.add('fade_in');
        };
        img.onload = loaded;
        img.src = bi;
        if (img.complete) loaded();
      }, 1)
    };
  };
  ready(do_heroloader);
})();


/** Slider **/
(function(){
  let init = function(){
    if(document.querySelector('main').classList.contains('__stories__')) {

      let cur_slide = 0;
      let mouseover = false;

      const max_slides = 3;
      let slide_width = document.querySelector('.intro_image').getBoundingClientRect().width + 25;
      const slider = document.querySelector('.slider .slides');
      const circles = document.querySelectorAll('.slider .circle');
      const indicators = document.querySelectorAll('.slider .indicator');

      const clear_indicators = function () {
        circles.forEach(function (e) {
          e.classList.remove('active')
        })
      };

      window.addEventListener('resize', function(){
        slide_width = document.querySelector('.intro_image').getBoundingClientRect().width  + 25;
        cur_slide = 0;
        navigate_to(0);

      });

      slider.addEventListener('mouseenter', function () {
        mouseover = true;
      });
      slider.addEventListener('mouseleave', function () {
        mouseover = false;
      });

      let navigate_to = function (slide) {
        slider.style.transform = "translate(-" + (slide * slide_width) + "px, 0)";
        clear_indicators();
        circles[slide].classList.add('active');
      };


      let interval = setInterval(function () {
        if (mouseover) {
          return;
        }

        cur_slide += 1;
        cur_slide %= max_slides;
        navigate_to(cur_slide);
      }, 3000);

      indicators.forEach(function (e, i) {
        e.addEventListener('click', function () {
          clearInterval(interval);
          cur_slide = i;
          navigate_to(i)
        });
      });
    }
  };
  ready(init);
})();

/** Topic_scroll **/
(function(){
  let init = function(){
    if(document.querySelector('main').classList.contains('__guidebook_section__')) {
      if(document.location.hash){
        scroll_to_id(document.location.hash.slice(1));
        history.replaceState("", document.title, window.location.pathname
            + window.location.search);
      }
    }
  };
  ready(init);
})();



})();

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */
"document"in self&&("classList"in document.createElement("_")&&(!document.createElementNS||"classList"in document.createElementNS("http://www.w3.org/2000/svg","g"))||!function(t){"use strict";if("Element"in t){var e="classList",n="prototype",i=t.Element[n],s=Object,r=String[n].trim||function(){return this.replace(/^\s+|\s+$/g,"")},o=Array[n].indexOf||function(t){for(var e=0,n=this.length;n>e;e++)if(e in this&&this[e]===t)return e;return-1},c=function(t,e){this.name=t,this.code=DOMException[t],this.message=e},a=function(t,e){if(""===e)throw new c("SYNTAX_ERR","The token must not be empty.");if(/\s/.test(e))throw new c("INVALID_CHARACTER_ERR","The token must not contain space characters.");return o.call(t,e)},l=function(t){for(var e=r.call(t.getAttribute("class")||""),n=e?e.split(/\s+/):[],i=0,s=n.length;s>i;i++)this.push(n[i]);this._updateClassName=function(){t.setAttribute("class",this.toString())}},u=l[n]=[],h=function(){return new l(this)};if(c[n]=Error[n],u.item=function(t){return this[t]||null},u.contains=function(t){return~a(this,t+"")},u.add=function(){var t,e=arguments,n=0,i=e.length,s=!1;do t=e[n]+"",~a(this,t)||(this.push(t),s=!0);while(++n<i);s&&this._updateClassName()},u.remove=function(){var t,e,n=arguments,i=0,s=n.length,r=!1;do for(t=n[i]+"",e=a(this,t);~e;)this.splice(e,1),r=!0,e=a(this,t);while(++i<s);r&&this._updateClassName()},u.toggle=function(t,e){var n=this.contains(t),i=n?e!==!0&&"remove":e!==!1&&"add";return i&&this[i](t),e===!0||e===!1?e:!n},u.replace=function(t,e){var n=a(t+"");~n&&(this.splice(n,1,e),this._updateClassName())},u.toString=function(){return this.join(" ")},s.defineProperty){var f={get:h,enumerable:!0,configurable:!0};try{s.defineProperty(i,e,f)}catch(p){void 0!==p.number&&-2146823252!==p.number||(f.enumerable=!1,s.defineProperty(i,e,f))}}else s[n].__defineGetter__&&i.__defineGetter__(e,h)}}(self),function(){"use strict";var t=document.createElement("_");if(t.classList.add("c1","c2"),!t.classList.contains("c2")){var e=function(t){var e=DOMTokenList.prototype[t];DOMTokenList.prototype[t]=function(t){var n,i=arguments.length;for(n=0;i>n;n++)t=arguments[n],e.call(this,t)}};e("add"),e("remove")}if(t.classList.toggle("c3",!1),t.classList.contains("c3")){var n=DOMTokenList.prototype.toggle;DOMTokenList.prototype.toggle=function(t,e){return 1 in arguments&&!this.contains(t)==!e?e:n.call(this,t)}}"replace"in document.createElement("_").classList||(DOMTokenList.prototype.replace=function(t,e){var n=this.toString().split(" "),i=n.indexOf(t+"");~i&&(n=n.slice(i),this.remove.apply(this,n),this.add(e),this.add.apply(this,n.slice(1)))}),t=null}());

function toggle_section(id) {
  document.getElementById(id).classList.toggle('closed');
}
