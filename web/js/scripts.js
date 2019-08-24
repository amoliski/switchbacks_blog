function ready(fn) {
    document.addEventListener('swup:contentReplaced', fn);
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

(function(){
    let set_up_ga = function(){
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'UA-142131190-1');
    };
    let register_hit = function(){
        ga('set', 'page', window.location.pathname);
        ga('send', 'pageview');
    };
    ready(set_up_ga);
    document.addEventListener('swup:contentReplaced', register_hit);
})();

(function() {
    let posts = [];
    let categories = {};
    let read_more = false;
    let article_count = 0;
    let category_count = 0;
    let active_category = "Date";
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

    function create_sm_article(data, fade_in, hide_location) {
        let thumb = data.thumbnail;
        let title = data.title;
        let url = data.url;
        let location = data.location;
        let classes = ['article', fade_in?'transparent':''].join(' ');
        let template = (
            '<div class="'+classes+'">'+
            '<a href="' + url + '">' +
            '<div class="article_image" style="background-image:url(' + thumb + ')"></div>' +
            '</a>' +
            '<div class="metadata">' +
            '<div class="title"><a href="' + url + '">' + title + '</a></div>' +
            ((location && !hide_location) ? '<div class="location">' + location + '</div>' : '') +
            '<a href="' + url + '" class="read_more">Read Article</a>' +
            '</div>' +
            '</div>'
        );
        return createElementFromHTML(template);
    }

    function create_md_article(data, fade_in, hide_location) {
        let thumb = data.thumbnail;
        let title = data.title;
        let url = data.url;
        let location = data.location;
        let classes = ['article', fade_in?'transparent':''].join(' ');
        let template = (
            '<div class="'+classes+'">'+
            '   <a href="' + url + '">' +
            '       <div class="article_image" style="background-image: url(' + thumb + ')">' +
            '       </div>' +
            '   </a>' +
            '   <div class="title">' +
            '       <a href="' + url + '">' + title + '</a></div>' +
            ((location && !hide_location) ? '<div class="location">' + location + '</div>' : '') +
            '<a href="' + url + '" class="read_more"><span>Read Article</span></a>' +
            '</div>'
        );
        return createElementFromHTML(template);
    }

    function clear_articles() {
        document.getElementById('posts_small').innerHTML = "";
        document.getElementById('posts_medium').innerHTML = "";
    }

    function add_category_title(name) {
        let sm_container = document.getElementById('posts_small');
        let md_container = document.getElementById('posts_medium');
        if (!read_more) {
            category_count += 1;
            if (category_count > 4) {
                throw {name: "ArticleLimit",message: ""};
            }
        }
        let template = (
            "<div class='wide'>" +
            "<h3 class='section_heading'>" + name + "</h3>" +
            "<hr class='section_break'/>" +
            "</div>"
        );
        sm_container.append(createElementFromHTML(template));
        md_container.append(createElementFromHTML(template));
    }

    function add_subcategory_title(name) {
        let sm_container = document.getElementById('posts_small');
        let md_container = document.getElementById('posts_medium');
        if (!read_more) {
            category_count += 1;
            if (category_count > 4) {
                throw {name: "ArticleLimit",message: ""};
            }
        }
        let template = (
            "<div class='wide'>" +
            "<h4 class='subsection_heading'>" + name + "</h4>" +
            "</div>"
        );
        sm_container.append(createElementFromHTML(template));
        md_container.append(createElementFromHTML(template));
    }

    function add_articles(articles, fade_in, hide_location) {
        let sm_container = document.getElementById('posts_small');
        let md_container = document.getElementById('posts_medium');
        let template = "<div class='section_container wide'></div>";

        let sm = createElementFromHTML(template);
        sm_container.append(sm);
        let md = createElementFromHTML(template);
        md_container.append(md);

        for (let i = 0; i < articles.length; i++) {
            sm.append(create_sm_article(articles[i], fade_in, hide_location));
            md.append(create_md_article(articles[i], fade_in, hide_location));
            if (!read_more) {
                article_count += 1;
                if (article_count > 9) {
                    throw {name: "ArticleLimit",message: ""};
                }
            }
        }
    }

    function render_dates(fade_in) {
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
                add_category_title(category_name, fade_in);
                add_articles(year[months[j]], fade_in);
            }
        }
    }

    function render_regions(fade_in) {
        let category = categories['Region'];
        // ['Northeast', 'Southwest', ...]
        let regions = Object.keys(category);
        // Alphasort regions
        regions.sort();

        update_submenu("Region", regions);

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
        let category = categories['Difficulty'];
        // ['Easy', 'Difficult', ...]
        let difficulties = Object.keys(category);
        // Sort Difficulties
        difficulties.sort(function (a, b) {
            return (difficulty_sort[a] || 10) - (difficulty_sort[b] || 10)
        });


        update_submenu("Difficulty", difficulties);

        for (let i = 0; i < difficulties.length; i++) {
            let difficulty_name = difficulties[i];
            if (active_subcategory !== "All" && active_subcategory !== difficulty_name) {
                continue;
            }
            let difficulty = category[difficulty_name];
            add_category_title(difficulty_name, fade_in);
            add_articles(difficulty, fade_in);
        }
    }

    function render_parks(fade_in) {
        let category = categories['Park'];
        let parks = Object.keys(category);
        parks.sort();

        update_submenu("Park Types", parks);
        for (let i = 0; i < parks.length; i++) {
            let park_type_name = parks[i];
            if (active_subcategory !== "All" && active_subcategory !== park_type_name) {
                continue;
            }

            let park_type = category[park_type_name];
            add_category_title(park_type_name, fade_in);
            let park_names = Object.keys(park_type);
            park_names.sort();

            for (let j = 0; j < park_names.length; j++) {
                add_subcategory_title(park_names[j], fade_in);
                add_articles(park_type[park_names[j]], fade_in, true);
            }
        }
    }

    function load_all() {
        read_more = true;
        render_active_category(true)
    }

    function reveal_articles(selector) {
        let all_articles = Array.from(document.querySelectorAll(selector));

        let show_next_element = function (el) {
            if (el.length === 0) return;
            el[0].classList.remove('transparent');
            setTimeout(function () {
                show_next_element(el.slice(1))
            }, 70)
        }
        setTimeout(function () {
            show_next_element(all_articles)
        }, 20)
    }

    function render_active_category(fade_in) {
        let sm_container = document.getElementById('posts_small');
        let md_container = document.getElementById('posts_medium');
        clear_articles();

        article_count = 0;
        category_count = 0;
        try {
            ({
                'Date': render_dates,
                'Region': render_regions,
                'Difficulty': render_difficulty,
                'Park': render_parks,
            }[active_category] || function () {
            })(fade_in)
        } catch (e) {
            if(e.name === 'ArticleLimit'){
                let template = '' +
                    '<div class="load_more_bg">' +
                    '<button class="load_more pill_button active">Load More</button>' +
                    '</div>';

                let sm_button = createElementFromHTML(template);
                let md_button = createElementFromHTML(template);
                sm_button.addEventListener('click', load_all);
                md_button.addEventListener('click', load_all);
                sm_container.append(sm_button);
                md_container.append(md_button);
            }else{
                throw e;
            }
        }
        reveal_articles("#posts_medium .transparent");
        reveal_articles("#posts_small .transparent");

    }

    function set_subcategory_button(subcategory) {
        let buttons = document.getElementById('trail_log_submenu').querySelectorAll('button:not(#button_' + subcategory.replace(/[ !@#$%^&*()\-/\\]/g, "_") + ')');
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].classList.remove('active');
        }
        document.getElementById("button_" + subcategory.replace(/[ !@#$%^&*()\-/\\]/g, "_")).classList.add('active');
    }

    let active_menu = null;

    function update_submenu(title, options) {
        let submenu = document.getElementById('trail_log_submenu');
        if (active_menu === title && submenu.children.length > 0) {
            return;
        }
        active_menu = title;
        submenu.innerHTML = "";
        let create_sub_button = function (sub_category) {
            let template = (
                '<button ' + (sub_category === active_subcategory ? 'class="filter_option pill_button pill_button_ripple active"' : 'class="filter_option pill_button pill_button_ripple"') +
                ' id="button_' + sub_category.replace(/[ !@#$%^&*()\-/\\]/g, "_") + '">' +
                sub_category +
                '<div class="ripple"></div></button>'
            );
            let button = createElementFromHTML(template);
            button.addEventListener('click', function (el) {
                set_subcategory_button(sub_category);
                active_subcategory = sub_category;
                render_active_category(true);
                let width = button.getClientRects()[0].width;
                let height = button.getClientRects()[0].height;
                let rsize = Math.max(width, height) * 2;
                button.children[0].style.width = rsize + "px";
                button.children[0].style.height = rsize + "px";
                button.children[0].style.left = ((-1 * (rsize / 2)) + el.offsetX) + "px";
                button.children[0].style.top = ((-1 * (rsize / 2)) + el.offsetY) + "px";


            });
            return button;
        };
        let submenu_header = (
            "<div class='wide'>" +
            "<h3 class='section_heading'>" + title + "</h3>" +
            "<hr class='section_break'/>" +
            "</div>"
        );
        submenu.append(createElementFromHTML(submenu_header))
        submenu.append(create_sub_button('All'));
        for (let p = 0; p < options.length; p++) {
            submenu.append(create_sub_button(options[p]));
        }


    }

    function set_category_button(category) {
        let buttons = document.getElementById('trail_log_menu').querySelectorAll('button:not(#button_' + category + ')');
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].classList.remove('active');
        }
        document.getElementById(category + '_button').classList.add('active');
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

        button.addEventListener('click', function (el) {
            set_category_button(category);
            active_subcategory = "All";
            active_category = category;

            let width = button.getClientRects()[0].width;
            let height = button.getClientRects()[0].height;
            let rsize = Math.max(width, height) * 2;
            button.children[0].style.width = rsize + "px";
            button.children[0].style.height = rsize + "px";
            button.children[0].style.left = ((-1 * (rsize / 2)) + el.offsetX) + "px";
            button.children[0].style.top = ((-1 * (rsize / 2)) + el.offsetY) + "px";

            render_active_category(true);

        });
        return button;
    }

    function create_filter_buttons() {
        let container = document.getElementById('trail_log_menu');
        for (let category in categories) {
            if (!categories.hasOwnProperty(category)) continue;
            container.appendChild(create_button(category));
        }
    }

    function process_articles() {
        for (let i = 0; i < posts.length; i++) {
            let post = posts[i];
            // Date
            let date = post.date.date.split(' ')[0].split('-');
            let year = date[0];
            let month = date[1];
            add_to_category_path(post, ['Date', year, month]);

            // Region
            let region = post.region || 'None';
            add_to_category_path(post, ['Region', region])

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
            enablejsapi: 1,
            iv_load_policy: 3
        };
        let currVid =  0; // Math.floor(Math.random() * video_list.length);
        let onPlayerReady = function(e){
            let tv = e.target

            tv.cueVideoById(video_list[currVid][0], Number(video_list[currVid[1]] || 0) || 0);
            if(autoplay) {
                tv.playVideo();
            }
            if(start_muted){
                tv.mute();
            }
            tv.setPlaybackRate(Number(video_list[currVid[2]] || 1) || 1);
            let player = document.getElementById(container);
            let width = player.getBoundingClientRect().width
            tv.setSize(width*.56, width)
            console.log(player, width);
            console.log({e})

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


let hide_title = function() {
    var title_block = document.querySelector('.__article__ .title_block');
    var hero_image = document.querySelector('.__article__ .heroImage');
    if(title_block){
        //title_block.classList.add('transparent');
    }
    if(hero_image){
        hero_image.classList.add('transparent');
    }
};
let show_title = function(){
    var title_block = document.querySelector('.__article__ .title_block');
    var hero_image = document.querySelector('.__article__ .heroImage');
    if(title_block){
        //title_block.classList.add('fade_in');
    }
    if(hero_image){
        hero_image.classList.add('fade_in');
    }
};


document.addEventListener('swup:contentReplaced', hide_title);
document.addEventListener('swup:transitionEnd', show_title);


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
