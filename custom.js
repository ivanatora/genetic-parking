width = view.size.width;
height = view.size.height;
frame_every = 1;
fps_counter = 0;
debug = false;

iMutationRate = 10; //%
iPopulationSize = 10;
bFinished = false;
population = null;
population_number = 0;
obstacles = [];
current_record = 0;

run = true;

/* http://www.auto-data.net/bg/?f=showCar&car_id=23840
Дължина	4617 мм.Редактирай тази кола
Широчина	1770 мм.Редактирай тази кола
Височина	1467 мм.Редактирай тази кола
Колесна база	2750 мм.Редактирай тази кола
Предна следа	1544 мм.Редактирай тази кола
Задна следа	1499 мм.
*/
car_scale = 2;
car_w = 17 * car_scale;
car_h = 46 * car_scale;
axis_h = 27 * car_scale;

targets = [
    new Point(400, height - 25),
    new Point(400 + axis_h, height - 25),
];

function setup() {
    iMaxFitness = 0;
    aSpawningPool = [];
    iPopulationNumber = 0;
    bFinished = false;
    population = null;

    generate_obstacles();
    generate_oseva_linia();
    generate_targets();
}

function generate_obstacles() {
    // upper row
    for (var i = 0; i < 4; i++){
        var obstacle = new Obstacle(new Point(10 + ((car_h + 30) * i), 10 ), car_h, car_w);
        obstacles.push(obstacle);
    }

    // bottom row
    for (var i = 0; i < 3; i++){
        var obstacle = new Obstacle(new Point(10 + ((car_h + 30) * i), height - car_w - 10), car_h, car_w);
        obstacles.push(obstacle);
    }
}

function generate_oseva_linia() {
    linia = new Path({
        segments: [[0, height/2], [width, height/2]],
//        selected: true
    })
    linia.strokeColor = rgba(255, 255, 255, 0.5);
    linia.strokeWidth = 2;
    linia.dashArray = [60, 30];
}

function generate_targets() {
    for (var i = 0; i < targets.length; i++){
        var target1 = new Path.Line(targets[i].x - 5, targets[i].y, targets[i].x + 5, targets[i].y);
        var target2 = new Path.Line(targets[i].x, targets[i].y - 5, targets[i].x, targets[i].y + 5);
        target1.strokeColor = 'green';
        target2.strokeColor = 'green';
    }
}

PI = Math.PI;
window.sin = function(x){
    return Math.sin(x);
}
window.cos = function(x){
    return Math.cos(x);
}
window.abs = function(x){
    return Math.abs(x);
}
window.radians = function(x){
    return x * (Math.PI / 180);
}
window.degrees = function(x){
    return x * (180 / Math.PI);
}
window.rgb = function(r, g, b){
    return new Color(r, g, b);
}
window.rgba = function(r, g, b, a){
    return new Color(r, g, b, a);
}
window.map = function (val, in_min, in_max, out_min, out_max) {
    return (val - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
window.map_range = function(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

$(document).ready(function(){
    $('.do').click(function(e){
        e.preventDefault();
        iMutationRate = parseInt($('input[name="mutation"]').val());
        if (isNaN(iMutationRate)){
            iMutationRate = 1;
        }

        iPopulationSize = parseInt($('input[name="population"]').val());
        if (isNaN(iPopulationSize)){
            iPopulationSize = 10;
        }
        population.setPopulationSize(iPopulationSize)

        population.lifespan = 0;

    })

    $('.pause').click(function(){
        console.log('PAUSED');
        run = false;
    })
    $('.resume').click(function(){
        console.log('RESUMED');
        run = true;
    })
})

setup();

function onFrame() {
    if (run == false) return; // play-pause

    fps_counter++;
    if (fps_counter % frame_every != 0) return; // 1 frame per X seconds
    
    if (! population){
        population = new Population(iPopulationSize);
    }

    population.update();
    population.show();

    population.lifespan--;
    if (population.lifespan <= 0){
        population.evaluate();
        population.crossover();
        population.purge();
        population.resurrect();

        $('.population_number').html(population_number++);
        $('.record').html(current_record);
    }
}