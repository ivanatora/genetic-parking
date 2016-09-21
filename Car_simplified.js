window.Car = function(genes){
    this.pos = new Point(car_h/2 + 200, height/2);
    this.acc = new Point(0, 0);
    this.vel = new Point(0, 0);
    
    this.maximum_wheel_angle = 30;
    this.current_wheel_angle = 0;
    this.last_wheel_angle = 0;
    this.heading = 0;
    this.last_heading = 0;
    this.delta_angle = 0;
    this.tr = 0;
    
    this.color = new Color(Math.random() * 255, Math.random() * 255, Math.random() * 255);
    
    this.fitness = 1; 
    this.is_dead = false;
    
    this.genes = genes || [];
    this.next_genes = [];
    this.update_counter = 0
    
    this.tire_w = 20;
    this.tire_h = 10;
    
    this.circle_pos = 0;
    
    // draw car body and wheels
    
    var pos_shape = new Path.Circle(this.pos, 5);
    pos_shape.fillColor = 'white';

    var car_shape = new Path.Rectangle(- car_h/2, - car_w/2, car_h, car_w);
    car_shape.fillColor = rgba(0, 0, 0, 0.1);
    car_shape.strokeColor = 'green';
    car_shape.position = this.pos;


    // wheels
    var front_shape = new Path.Rectangle(0, 0, this.tire_w, this.tire_h);
    front_shape.fillColor = rgba(255, 0, 0, 0.5);
    front_shape.strokeColor = 'green';
    front_shape.position.x = this.pos.x - axis_h/2 * cos(radians(this.heading));
    front_shape.position.y = this.pos.y - axis_h/2 * sin(radians(this.heading));
    front_shape.rotate(this.heading);
    front_shape.rotate(this.current_wheel_angle);


    var back_shape = new Path.Rectangle(0, 0, this.tire_w, this.tire_h);
    back_shape.fillColor = rgba(0, 0, 0, 0.1);
    back_shape.strokeColor = 'green';
    back_shape.position.x = this.pos.x + axis_h/2 * cos(radians(this.heading));
    back_shape.position.y = this.pos.y + axis_h/2 * sin(radians(this.heading));
    back_shape.rotate(this.heading);
    
    
    tr_shape = new Path.Circle(new Point(0, 0), 1);
    tr_shape.strokeColor = 'green';
    
    radius_line = new Path.Line(0, 0);
    radius_line.strokeColor = 'green';
    radius_line.dashArray = [10, 10];
    
//    new_pos_shape = new Path.Circle(new Point(0, 0), 10);
    new_pos_shape = new Path.Rectangle(0, 0, 10, 20);
    new_pos_shape.fillColor = 'pink';
    
    new_back_shape = new Path.Circle(new Point(0, 0), 5);
    new_back_shape.fillColor = 'green';
    
    
    this.update = function(){
        if (this.is_dead) return;

        
        
        front_shape.rotate(-this.last_wheel_angle);
//        this.last_heading = this.heading;
        car_shape.rotate(-this.heading);
        
        front_shape.rotate(-this.heading);
        back_shape.rotate(-this.heading);
        
        
        car_shape.position = this.pos;
        pos_shape.position = this.pos;

        // get new iteration parameter
        var impulse;
        if (this.genes.length > 0 && this.genes.length > this.update_counter){
            impulse = this.genes[this.update_counter];
        }
        else {
            impulse = Math.random() * 10 - 5; // random rotation
        }
        impulse = 10;
        this.next_genes.push(impulse); // save for further generations
        
        this.current_wheel_angle = Math.min(this.maximum_wheel_angle, Math.max(-this.maximum_wheel_angle, this.current_wheel_angle + impulse));
        this.last_wheel_angle = this.current_wheel_angle;
        
        // calculate turning radius and travelled arc length
        this.tr = axis_h / sin(radians(this.current_wheel_angle));
        turning_circle_len = abs(PI * 2 * this.tr);
        arc_angle = 50 / this.tr; // 20 is default

        this.tr += car_w / 2;
        
        radius_center = back_shape.position.clone().subtract(front_shape.position.clone()).rotate(-90);
        radius_center.length = this.tr;
        radius_center = radius_center.add(back_shape.position.clone())
        
        
        tr_shape.position = radius_center;
        var tmp_r = tr_shape.bounds.width / 2;
        tr_shape.scale(this.tr / tmp_r);
        
        
        radius_line.segments[0].point = radius_center;
        radius_line.segments[1].point = back_shape.position;
        
        cntr_to_pos = this.pos.clone().subtract(radius_center);
        cntr_to_back = back_shape.position.clone().subtract(radius_center);
        console.log('cntr_to_back.angle', cntr_to_back.angle, 'arc_angle in degrees', degrees(arc_angle))

        new_arc_angle_radians = cntr_to_back.angleInRadians - arc_angle;
//        new_arc_angle_radians =  arc_angle;
        if (this.current_wheel_angle < 0){
            new_arc_angle_radians = new_arc_angle_radians + PI;
        }
        else {
//            new_arc_angle_radians = new_arc_angle_radians;
        }
        new_back = new Point(radius_center.x + this.tr * cos(new_arc_angle_radians), radius_center.y + this.tr * sin(new_arc_angle_radians));
        
        this.heading += new_arc_angle_radians;
        console.log('new heading', this.heading, 'newarc_angle in degrees', degrees(new_arc_angle_radians))
        
        new_pos = this.pos.clone().subtract(back_shape.position.clone().subtract(new_back));
        new_pos.rotate(-degrees(new_arc_angle_radians), new_back);
        console.log('new_pos', new_pos)
        new_pos_shape.position = new_pos;
        
        new_back_shape.position = new_back;

        
        front_shape.rotate(this.current_wheel_angle);
        car_shape.rotate(this.heading);
//        car_shape.position = new_pos;
        front_shape.position.x = car_shape.position.x - axis_h/2 * cos(radians(this.heading));
        front_shape.position.y = car_shape.position.y - axis_h/2 * sin(radians(this.heading));
        front_shape.rotate(this.heading);
        back_shape.position.x = car_shape.position.x + axis_h/2 * cos(radians(this.heading));
        back_shape.position.y = car_shape.position.y + axis_h/2 * sin(radians(this.heading));
        back_shape.rotate(this.heading);
        
        this.update_counter++;
    }
    
    this.evaluate = function(){
        
    }
    
    this.constrain_to_screen = function(){
        // don't get outside the screen
        if (this.pos.y > height){ // on floor
            this.is_dead = true;
        }
        if (this.pos.x > width){ // on left
            this.is_dead = true;
        }
        if (this.pos.x < 0){ // on right
            this.is_dead = true;
        }
        
        if (this.is_dead){ // remove the defective gene
            this.next_genes.splice(this.jump_counter-1, 1);
        }
        // do we care about shooting above top? probably not
    }
    
    this.show = function(){
        
        
    }
    
    this.hits = function(obstacle){
        
    }
}
