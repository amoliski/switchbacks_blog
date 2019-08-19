var posts = [];
var categories = {};
var timeout = null;
var read_more = false;
var article_count = 0;
var category_count = 0;
var active_category = "Date";

var month_names = {
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
var difficulty_sort = {
    'Easy': 1,
    'Moderate': 2,
    'Difficult': 3,
    'None': 4,
};

var sm_container = document.getElementById('posts_small');
var md_container = document.getElementById('posts_medium');


function add_to_category_path(element, path){
    var active = categories;
    for(var i = 0; i < path.length-1; i++){
        var path_el = path[i];
        if(!(path_el in active)){
            active[path_el] = {};
        }
        active = active[path_el]
    }
    var last_el = path[path.length - 1];
    if(!(last_el in active)){
        active[last_el] = []
    }
    active[last_el].push(element);
}
function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild;
}

function create_sm_article(data, hide_location){
    var thumb = data.thumbnail;
    var title = data.title;
    var url = data.url;
    var location = data.location;
    var template = (
        '<div class="article">'+
        '<a href="'+url+'">'+
            '<div class="article_image" style="background-image:url('+thumb+')"></div>' +
        '</a>'+
        '<div class="metadata">'+
            '<div class="title"><a href="'+url+'">'+title+'</a></div>'+
            ((location && !hide_location)?'<div class="location">'+location+'</div>':'' )+
            '<a href="'+url+'" class="read_more">Read More</a>' +
        '</div>'+
        '</div>'
    );
    return createElementFromHTML(template);
}
function create_md_article(data, hide_location){
    var thumb = data.thumbnail;
    var title = data.title;
    var url = data.url;
    var location = data.location;
    var template = (
        '<div class="article">'+
        '   <a href="'+url+'">'+
        '       <div class="article_image" style="background-image: url('+thumb+')">'+
        '       </div>'+
        '   </a>'+
        '   <div class="title">' +
        '       <a href="'+url+'">'+title+'</a></div>'+
        ((location && !hide_location)?'<div class="location">'+location+'</div>':'' )+
        '<a href="'+url+'" class="read_more"><span>Read More</span></a>'+
        '</div>'
        );
    return createElementFromHTML(template);
}

function clear_buttons(){
    var buttons = document.querySelectorAll('.filter_option');
    for(var i = 0; i < buttons.length; i++){
        buttons[i].classList.remove('active');
    }
}

function clear_articles(){
    sm_container.innerHTML = "";
    md_container.innerHTML = "";
}

function add_category_title(name){
    if(!read_more){
        category_count += 1;
        if(category_count > 4){
            throw new Exception();
        }
    }
    var template = (
      "<div class='wide'>" +
      "<h3 class='section_heading'>"+name+"</h3>" +
      "<hr class='section_break'/>" +
      "</div>"
    );
    sm_container.append(createElementFromHTML(template));
    md_container.append(createElementFromHTML(template));
}

function add_subcategory_title(name){
    if(!read_more){
        category_count += 1;
        if(category_count > 4){
            throw new Exception();
        }
    }
    var template = (
      "<div class='wide'>" +
      "<h4 class='subsection_heading'>"+name+"</h4>" +
      "</div>"
    );
    sm_container.append(createElementFromHTML(template));
    md_container.append(createElementFromHTML(template));
}

function add_articles(articles, hide_location){
    var template = "<div class='section_container wide'></div>";

    var sm = createElementFromHTML(template); sm_container.append(sm);
    var md = createElementFromHTML(template); md_container.append(md);

    for(var i = 0; i < articles.length; i++){
        sm.append(create_sm_article(articles[i], hide_location));
        md.append(create_md_article(articles[i], hide_location));
        if(!read_more){
            console.log(article_count);
            article_count += 1;
            if(article_count > 9){
                throw new Exception();
            }
        }
    }
}

function render_dates(){
    var category = categories['Date'];
    var years = Object.keys(category);
    // Reverse chronological
    years.sort().reverse();

    for(var i = 0; i < years.length; i++){
        var year = category[years[i]];
        var months = Object.keys(year);

        months.sort().reverse();
        for(var j = 0; j < months.length; j++){
            var category_name = month_names[months[j]]+" "+years[i];
            add_category_title(category_name);
            add_articles(year[months[j]]);
        }
    }
}

function render_regions(){
    var category = categories['Region'];
    // ['Northeast', 'Southwest', ...]
    var regions = Object.keys(category);
    // Alphasort regions
    regions.sort();

    for(var i = 0; i < regions.length; i++){
        var region_name = regions[i];
        var region = category[region_name];
        add_category_title(region_name);
        add_articles(region);
    }
}

function render_difficulty(){
    var category = categories['Difficulty'];
    // ['Easy', 'Difficult', ...]
    var difficulties = Object.keys(category);
    // Alphasort regions
    difficulties.sort(function(a,b){
        return (difficulty_sort[a] || 10) - (difficulty_sort[b] || 10)
    });

    for(var i = 0; i < difficulties.length; i++){
        var difficulty_name = difficulties[i];
        var difficulty = category[difficulty_name];
        add_category_title(difficulty_name);
        add_articles(difficulty);
    }
}

function render_parks(){
    var category = categories['Park'];
    var parks = Object.keys(category);
    parks.sort();

    for(var i = 0; i < parks.length; i++){
        var park_type_name = parks[i];
        var park_type = category[park_type_name];
        add_category_title(park_type_name);
        var park_names = Object.keys(park_type);
        park_names.sort();

        for(var j = 0; j < park_names.length; j++){
            add_subcategory_title(park_names[j]);
            add_articles(park_type[park_names[j]], true);
        }
    }
}

function load_all(){
    read_more = true;
    render_category()
}

function render_category(){
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
        })()
    }catch(e) {
        var template = '' +
            '<div class="load_more_bg">' +
            '<button class="load_more pill_button active">Load More</button>' +
            '</div>';
        var sm_button = createElementFromHTML(template);
        var md_button = createElementFromHTML(template);
        sm_button.addEventListener('click', load_all);
        md_button.addEventListener('click', load_all);
        sm_container.append(sm_button);
        md_container.append(md_button);
    }
}

function create_button(category){
    var template = (
        '<button ' +(category === active_category ? 'class="filter_option pill_button active"' : 'class="filter_option  pill_button"') +
        ' id="'+category+'_button">'+
            category +
        '</button>'
    );
    var button = createElementFromHTML(template);
    button.addEventListener('click', function(el){
        clear_buttons();
        el.target.classList.add('active');
        active_category = category;
        render_category();
    });
    return button;
}

function create_filter_buttons(){
    var container = document.getElementById('trail_log_menu');
    for(var category in categories){
        if(!categories.hasOwnProperty(category)) continue;
        container.appendChild(create_button(category));
    }
}

function load_articles(){
    for (var i = 0; i < posts.length; i++) {
        var post = posts[i];
        // Date
        var date = post.date.date.split(' ')[0].split('-');
        var year = date[0];
        var month = date[1];
        add_to_category_path(post, ['Date', year, month]);

        // Region
        var region = post.region || 'None';
        add_to_category_path(post, ['Region', region])

        // Difficulty
        var difficulty = post.difficulty || 'None';
        add_to_category_path(post, ['Difficulty', difficulty]);

        //Park
        var park = post.location || "None";
        var type = post.type || "None";
        add_to_category_path(post, ['Park', type, park])
    }
    create_filter_buttons();
    render_category(active_category);
}


(function(){

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/articles');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function(){
        if(xhr.status !== 200){
            console.log('XHR ERROR');
            return
        }
        posts = JSON.parse(xhr.responseText);
        load_articles();
    };
    xhr.send();


})();
