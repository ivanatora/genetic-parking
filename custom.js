width = view.size.width;
height = view.size.height;

iMutationRate = 1; //%
iPopulationSize = 1;
bFinished = false;
population = null;
population_number = 0;
obstacles = [];
current_record = 0;
targets = [];

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

function setup() {
    iMaxFitness = 0;
    aSpawningPool = [];
    iPopulationNumber = 0;
    bFinished = false;
    population = null;
    
//    createCanvas(480, 200);
//    createCanvas(1000, 1000);
//    background(0);
    
    targets = [
        createVector(260, height - 25),
        createVector(260 + axis_h, height - 25),
    ];
    
//    generate_obstacles();
    generate_oseva_linia();
    generate_targets();
}

function onFrame() {
    generate_oseva_linia(); // bring those back at some point
//    generate_targets();
    
//    if (! population){
//        population = new Population(iPopulationSize);
//    }
//    
//    population.update();
//    population.show();
//    
//    for (var i = 0; i < obstacles.length; i++){
//        obstacles[i].show();
//    }
//    
//    population.lifespan--;
//    if (population.lifespan <= 0){
//        population.evaluate();
//        population.crossover();
//        population.resurrect();
//        
//        $('.population_number').html(population_number++);
//        $('.record').html(current_record);
//    }
    
}

function generate_obstacles() {
    // bottom row
    var obstacle1 = new Obstacle(createVector(10, height - 10 - car_w), car_h, car_w);
    obstacles.push(obstacle1);
    
    // parking space here
    
    var obstacle2 = new Obstacle(createVector(130, height - 10 - car_w), car_h, car_w);
    obstacles.push(obstacle2);
    
    var obstacle3 = new Obstacle(createVector(230 + 30 + car_h, height - 10 - car_w), car_h, car_w);
    obstacles.push(obstacle3);
    
    // upper row
    for (var i = 0; i < 4; i++){
        var obstacle = new Obstacle(createVector(10 + ((car_h + 30) * i), 10 ), car_h, car_w);
        obstacles.push(obstacle);
    }
}

function generate_oseva_linia() {
    linia = new Path({
        segments: [[0, height/2], [width, height/2]],
//        selected: true
    })
    linia.strokeColor = '#fff';
    linia.strokeWidth = 5;
    linia.dashArray = [60, 30];
}

function generate_targets() {
    stroke(0, 255, 0);
    strokeWeight(1);
    for (var i = 0; i < targets.length; i++){
        line(targets[i].x - 5, targets[i].y, targets[i].x + 5, targets[i].y);
        line(targets[i].x, targets[i].y - 5, targets[i].x, targets[i].y + 5);
    }
}


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
    
    setup();
})

$('.pause').click(function(){
    console.log('PAUSED');
    noLoop();
})
$('.resume').click(function(){
    console.log('RESUMED');
    loop();
})