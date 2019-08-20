var posts = [];
var categories = {};
var read_more = false;
var article_count = 0;
var category_count = 0;
var active_category = "Date";
var active_subcategory = 'All';

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

var sm_container, md_container;

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
            '<a href="'+url+'" class="read_more">Read Article</a>' +
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
        '<div class="article transparent">'+
        '   <a href="'+url+'">'+
        '       <div class="article_image" style="background-image: url('+thumb+')">'+
        '       </div>'+
        '   </a>'+
        '   <div class="title">' +
        '       <a href="'+url+'">'+title+'</a></div>'+
        ((location && !hide_location)?'<div class="location">'+location+'</div>':'' )+
        '<a href="'+url+'" class="read_more"><span>Read Article</span></a>'+
        '</div>'
        );
    return createElementFromHTML(template);
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

    update_submenu("Year", years);

    for(var i = 0; i < years.length; i++){
        var year = category[years[i]];
        if(active_subcategory !== "All" && active_subcategory !== String(years[i])){
            continue;
        }
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

    update_submenu("Region", regions);

    for(var i = 0; i < regions.length; i++){
        var region_name = regions[i];
        if(active_subcategory !== "All" && active_subcategory !== region_name){
            continue;
        }
        var region = category[region_name];
        add_category_title(region_name);
        add_articles(region);
    }
}

function render_difficulty(){
    var category = categories['Difficulty'];
    // ['Easy', 'Difficult', ...]
    var difficulties = Object.keys(category);
    // Sort Difficulties
    difficulties.sort(function(a,b){
        return (difficulty_sort[a] || 10) - (difficulty_sort[b] || 10)
    });


    update_submenu("Difficulty", difficulties);

    for(var i = 0; i < difficulties.length; i++){
        var difficulty_name = difficulties[i];
        if(active_subcategory !== "All" && active_subcategory !== difficulty_name){
            continue;
        }
        var difficulty = category[difficulty_name];
        add_category_title(difficulty_name);
        add_articles(difficulty);
    }
}

function render_parks(){
    var category = categories['Park'];
    var parks = Object.keys(category);
    parks.sort();

    update_submenu("Park Types", parks);
    for(var i = 0; i < parks.length; i++){
        var park_type_name = parks[i];
        if(active_subcategory !== "All" && active_subcategory !== park_type_name){
            continue;
        }

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
    render_active_category()
}

function render_active_category(){
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
        console.log(e)
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
    var all_articles = Array.from(document.querySelectorAll('.article'));
    var show_article = function(arts){
        if(arts.length === 0) return
        arts[0].classList.remove('transparent');
        setTimeout(function(){show_article(arts.slice(1))}, 70)
    }

    setTimeout(function(){show_article(all_articles)}, 20)

}

function set_subcategory_button(subcategory){
    var buttons = document.getElementById('trail_log_submenu').querySelectorAll('button:not(#button_'+subcategory.replace(/[ !@#$%^&*()\-/\\]/g,"_")+')');
    for(var i = 0; i < buttons.length; i++){
        buttons[i].classList.remove('active');
    }
    document.getElementById("button_"+subcategory.replace(/[ !@#$%^&*()\-/\\]/g,"_")).classList.add('active');
}

var active_menu = null;
function update_submenu(title, options){
    var submenu = document.getElementById('trail_log_submenu');
    if(active_menu === title){
        return;
    }
    active_menu = title;
    submenu.innerHTML = "";
    var create_sub_button = function(sub_category){
        var template = (
            '<button ' +(sub_category === active_subcategory ? 'class="filter_option pill_button pill_button_ripple active"' : 'class="filter_option pill_button pill_button_ripple"') +
            ' id="button_'+sub_category.replace(/[ !@#$%^&*()\-/\\]/g,"_")+'">'+
            sub_category +
            '<div class="ripple"></div></button>'
        );
        var button = createElementFromHTML(template);
        button.addEventListener('click', function(el){
            set_subcategory_button(sub_category);
            active_subcategory = sub_category;
            render_active_category();
            var width = button.getClientRects()[0].width;
            var height = button.getClientRects()[0].height;
            var rsize = Math.max(width, height) * 2;
            button.children[0].style.width = rsize+"px";
            button.children[0].style.height = rsize+"px";
            button.children[0].style.left = ((-1 * (rsize/2)) + el.offsetX)+"px";
            button.children[0].style.top = ((-1 * (rsize/2))  + el.offsetY)+"px";


        });
        return button;
    };
    var submenu_header = (
        "<div class='wide'>" +
        "<h3 class='section_heading'>"+title+"</h3>" +
        "<hr class='section_break'/>" +
        "</div>"
    );
    submenu.append(createElementFromHTML(submenu_header))
    submenu.append(create_sub_button('All'));
    for(var p = 0; p < options.length; p++) {
        submenu.append(create_sub_button(options[p]));
    }


}

function set_category_button(category){
    var buttons = document.getElementById('trail_log_menu').querySelectorAll('button:not(#button_'+category+')');
    for(var i = 0; i < buttons.length; i++){
        buttons[i].classList.remove('active');
    }
    document.getElementById(category+'_button').classList.add('active');
}

function create_button(category){
    var template = (
        '<button  id="'+category+'_button"' +(category === active_category ?
            'class="filter_option active pill_button pill_button_ripple"' :
            'class="filter_option  pill_button pill_button_ripple"') +
        '>'+
            category +
        '<div class="ripple"></div></button>'
    );
    var button = createElementFromHTML(template);

    button.addEventListener('click', function(el){
        set_category_button(category);
        active_subcategory = "All";
        active_category = category;

        var width = button.getClientRects()[0].width;
        var height = button.getClientRects()[0].height;
        var rsize = Math.max(width, height) * 2;
        button.children[0].style.width = rsize+"px";
        button.children[0].style.height = rsize+"px";
        button.children[0].style.left = ((-1 * (rsize/2)) + el.offsetX)+"px";
        button.children[0].style.top = ((-1 * (rsize/2))  + el.offsetY)+"px";

        render_active_category();

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
    render_active_category(active_category);
}

function ready(fn) {
    if (document.readyState !== 'loading'){
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

ready(function(){
    sm_container = document.getElementById('posts_small');
    md_container = document.getElementById('posts_medium');

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
});
