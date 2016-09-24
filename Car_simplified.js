window.Car = function(genes){
    this.pos = new Point(car_h/2, height/2);

    this.maximum_wheel_angle = 40;
    this.current_wheel_angle = 0;
    this.last_wheel_angle = 0;
    this.heading_radians = 0;
    this.delta_angle = 0;
    this.tr = 0;
    
    this.fitness = 1;
    this.last_fitness = 0;
    this.max_fitness = 1;
    this.is_dead = false;
    this.is_hit = false;
    
    this.genes = genes || [];
    this.next_genes = [];
    this.update_counter = 0;
    
    this.tire_w = 20;
    this.tire_h = 10;
    
    this.circle_pos = 0;
    
    // draw car body and wheels
    this.car_shape = new Path.Rectangle(- car_h/2, - car_w/2, car_h, car_w);
    this.car_shape.fillColor = rgba(0, 0, 0, 0.1);
    this.car_shape.strokeColor = 'green';
    this.car_shape.position = this.pos;

    // wheels
    this.front_shape = new Path.Rectangle(0, 0, this.tire_w, this.tire_h);
    // this.front_shape.fillColor = rgba(255, 0, 0, 0.5);
    // this.front_shape.strokeColor = 'green';
    this.front_shape.fillColor = rgba(0, 0, 0, 0);
    this.front_shape.position.x = this.pos.x - axis_h/2 * cos(this.heading_radians);
    this.front_shape.position.y = this.pos.y - axis_h/2 * sin(this.heading_radians);
    this.front_shape.rotate(degrees(this.heading_radians));
    this.front_shape.rotate(this.current_wheel_angle);
    this.front_up_shape = new Path.Rectangle(0, 0, this.tire_w, this.tire_h);
    this.front_up_shape.fillColor = rgba(255, 0, 0, 0.5);
    this.front_up_shape.strokeColor = 'green';
    this.front_down_shape = new Path.Rectangle(0, 0, this.tire_w, this.tire_h);
    this.front_down_shape.fillColor = rgba(255, 0, 0, 0.5);
    this.front_down_shape.strokeColor = 'green';

    this.back_shape = new Path.Rectangle(0, 0, this.tire_w, this.tire_h);
    // this.back_shape.fillColor = rgba(0, 0, 0, 0.1);
    this.back_shape.fillColor = rgba(0, 0, 0, 0);
    // this.back_shape.strokeColor = 'green';
    this.back_shape.position.x = this.pos.x + axis_h/2 * cos(this.heading_radians);
    this.back_shape.position.y = this.pos.y + axis_h/2 * sin(this.heading_radians);
    this.back_shape.rotate(degrees(this.heading_radians));
    this.back_up_shape = new Path.Rectangle(0, 0, this.tire_w, this.tire_h);
    this.back_up_shape.fillColor = rgba(0, 0, 0, 0.1);
    this.back_up_shape.strokeColor = 'green';
    this.back_down_shape = new Path.Rectangle(0, 0, this.tire_w, this.tire_h);
    this.back_down_shape.fillColor = rgba(0, 0, 0, 0.1);
    this.back_down_shape.strokeColor = 'green';
    
    
    this.tr_shape = new Path.Circle(new Point(0, 0), 1);
    this.tr_shape.strokeColor = 'green';
    if (! debug){
        this.tr_shape.strokeColor = rgba(0, 0, 0, 0);
    }
    
    this.radius_line = new Path.Line(0, 0);
    this.radius_line.strokeColor = 'green';
    this.radius_line.dashArray = [10, 10];
    if (! debug){
        this.radius_line.strokeColor = rgba(0, 0, 0, 0);
    }
    
//    this.new_pos_shape = new Path.Circle(new Point(0, 0), 10);
    this.new_pos_shape = new Path.Circle(new Point(0, 0), 3);
    this.new_pos_shape.fillColor = 'pink';
    if (! debug){
        this.new_pos_shape.fillColor = rgba(0, 0, 0, 0);
    }
    
    this.new_back_shape = new Path.Circle(new Point(0, 0), 5);
    this.new_back_shape.fillColor = 'green';
    if (! debug){
        this.new_back_shape.fillColor = rgba(0, 0, 0, 0);
    }
    
    
    this.update = function(){
        if (this.is_dead) return;

        
        // rotate() works relative to the previous position, so make sure that position is 0
        this.front_shape.rotate(-this.last_wheel_angle);
        this.front_up_shape.rotate(-this.last_wheel_angle);
        this.front_down_shape.rotate(-this.last_wheel_angle);
        this.car_shape.rotate(degrees(-this.heading_radians));
        this.front_shape.rotate(degrees(-this.heading_radians));
        this.front_up_shape.rotate(degrees(-this.heading_radians));
        this.front_down_shape.rotate(degrees(-this.heading_radians));
        this.back_shape.rotate(degrees(-this.heading_radians));
        this.back_up_shape.rotate(degrees(-this.heading_radians));
        this.back_down_shape.rotate(degrees(-this.heading_radians));

        //
        // this.car_shape.position = this.pos;
        // this.pos_shape.position = this.pos;

        // get new iteration parameter
        var impulse;
        if (this.genes.length > 0 && this.genes.length > this.update_counter){
            impulse = this.genes[this.update_counter];
        }
        else {
            impulse = Math.random() * 30 - 15; // random rotation
        }
        // impulse = -10;
        this.next_genes.push(impulse); // save for further generations
        
        // limit steering angle
        this.current_wheel_angle += impulse;
        if (this.current_wheel_angle > this.maximum_wheel_angle) this.current_wheel_angle = this.maximum_wheel_angle;
        if (this.current_wheel_angle < -this.maximum_wheel_angle) this.current_wheel_angle = -this.maximum_wheel_angle;

        this.last_wheel_angle = this.current_wheel_angle;
        
        // calculate turning radius and travelled arc length
        this.tr = axis_h / Math.abs(sin(radians(this.current_wheel_angle)));
        // var turning_circle_len = abs(PI * 2 * this.tr); // we might need this at some point, but not now
        var arc_angle = 10 / this.tr; // 20 is looking okay
        if (this.current_wheel_angle < 0) arc_angle = - arc_angle; // in this case we want a reverse arc angle

        this.tr += car_w / 2;

        // get the turning radius and shape
        var backShapePos = this.back_shape.position;
        var frontShapePos = this.front_shape.position;
        var radius_center = null;
        radius_center = backShapePos.subtract(frontShapePos)//.rotate(-90);
        if (this.current_wheel_angle > 0) {
            radius_center = radius_center.rotate(-90);
        }
        else {
            radius_center = radius_center.rotate(90);
        }
        radius_center.length = this.tr;
        radius_center = radius_center.add(this.back_shape.position)

        this.tr_shape.position = radius_center;
        var tmp_r = this.tr_shape.bounds.width / 2;
        this.tr_shape.scale(this.tr / tmp_r);
        
        this.radius_line.segments[0].point = radius_center;
        this.radius_line.segments[1].point = backShapePos;
        
        var cntr_to_back = backShapePos.subtract(radius_center);
        var new_arc_angle_radians = cntr_to_back.angleInRadians - arc_angle;

        // the back of the car should be on that turning circle
        new_back = new Point(
            radius_center.x + this.tr * cos(new_arc_angle_radians),
            radius_center.y + this.tr * sin(new_arc_angle_radians));

        var cntr_to_new_back = new_back.subtract(radius_center);

        this.heading_radians = cntr_to_new_back.angleInRadians;
        if (this.current_wheel_angle > 0){
            this.heading_radians -= PI/2;
        }
        else {
            this.heading_radians += PI/2;
        }

        // center of the car is rotated around the back axle
        new_pos = new Point(
            new_back.x - axis_h/2 * cos(this.heading_radians),
            new_back.y - axis_h/2 * sin(this.heading_radians));

        // move some stuff
        this.new_pos_shape.position = new_pos;
        this.new_back_shape.position = new_back;

        // and really move some shapes
        this.front_shape.rotate(this.current_wheel_angle);
        this.front_up_shape.rotate(this.current_wheel_angle);
        this.front_down_shape.rotate(this.current_wheel_angle);
        this.car_shape.rotate(degrees(this.heading_radians));
        this.car_shape.position = new_pos;

        frontShapePos.x = this.car_shape.position.x - axis_h/2 * cos(this.heading_radians);
        frontShapePos.y = this.car_shape.position.y - axis_h/2 * sin(this.heading_radians);
        this.front_shape.rotate(degrees(this.heading_radians));
        this.front_up_shape.position = backShapePos.subtract(frontShapePos);
        this.front_up_shape.position.length = car_w / 2;
        this.front_up_shape.position = this.front_up_shape.position.add(frontShapePos).rotate(-90, frontShapePos)
        this.front_up_shape.rotate(degrees(this.heading_radians));

        this.front_down_shape.position = backShapePos.subtract(frontShapePos);
        this.front_down_shape.position.length = car_w / 2;
        this.front_down_shape.position = this.front_down_shape.position.add(frontShapePos).rotate(90, frontShapePos)
        this.front_down_shape.rotate(degrees(this.heading_radians));

        backShapePos.x = this.car_shape.position.x + axis_h/2 * cos(this.heading_radians);
        backShapePos.y = this.car_shape.position.y + axis_h/2 * sin(this.heading_radians);
        this.back_shape.rotate(degrees(this.heading_radians));
        this.back_up_shape.position = frontShapePos.subtract(backShapePos);
        this.back_up_shape.position.length = car_w / 2;
        this.back_up_shape.position = this.back_up_shape.position.add(backShapePos).rotate(-90, backShapePos)
        this.back_up_shape.rotate(degrees(this.heading_radians));

        this.back_down_shape.position = frontShapePos.subtract(backShapePos);
        this.back_down_shape.position.length = car_w / 2;
        this.back_down_shape.position = this.back_down_shape.position.add(backShapePos).rotate(90, backShapePos)
        this.back_down_shape.rotate(degrees(this.heading_radians));

        this.pos = this.car_shape.position;
        
        this.update_counter++;

        this.constrain_to_screen();
        this.check_obstacles();
    }
    
    this.evaluate = function(){
        var dist_back = this.back_shape.position.getDistance(targets[1]);
        var dist_front = this.front_shape.position.getDistance(targets[0]);
        var desired_angle = 0;
        var max_dist = 200;
        var fitness_front = map(dist_front, 0, max_dist, 100, 0);
        var fitness_back = map(dist_back, 0, max_dist, 100, 0);
        this.fitness = (fitness_back + fitness_front) / 2;
        if (this.is_hit){
            this.fitness /= 2;
        }
        this.heading_penalty = Math.floor(map(Math.abs(this.heading_radians), 0, PI, 0, 40));
        this.fitness -= this.heading_penalty;

        if (this.fitness < 0){
            this.fitness = 10;
        }

        if (this.fitness > 90 && this.fitness < this.last_fitness){
            run = false;
            console.log('winner', this)
            console.log('fitness_front', fitness_front, 'back', fitness_back)
            this.car_shape.fillColor = 'green';
        }

        this.fitness = Math.round(this.fitness);
        if (this.fitness > this.max_fitness){
            this.max_fitness = this.fitness;
        }
        this.last_fitness = this.fitness;
        // this.fitness = Math.pow(this.fitness, 3);
        // console.log('fitness', this.fitness, this.heading_radians)
    }
    
    this.constrain_to_screen = function(){
        // don't get outside the screen
        if (this.pos.y > height){ // on floor
            this.is_dead = true;
        }
        if (this.pos.y < 0){ // on floor
            this.is_dead = true;
        }
        if (this.pos.x > width){ // on left
            this.is_dead = true;
        }
        if (this.pos.x < 0){ // on right
            this.is_dead = true;
        }
        
        if (this.is_dead){ // remove the defective gene
            this.next_genes.splice(this.update_counter-1, 1);
        }
        // do we care about shooting above top? probably not
    }

    this.show = function(){
        
        
    }
    
    this.check_obstacles = function(){
        for (var i = 0; i < obstacles.length; i++){
            for (var j = 0; j < 4; j++){
                if (obstacles[i].shape.contains(this.car_shape.segments[j].point)){
                    this.is_dead = true;
                    this.is_hit = true;
                    return;
                }
            }
        }
    }

    this.remove = function(){
        this.car_shape.remove();
        this.front_shape.remove();
        this.front_up_shape.remove();
        this.front_down_shape.remove();
        this.back_shape.remove();
        this.back_up_shape.remove();
        this.back_down_shape.remove();
    }
}
