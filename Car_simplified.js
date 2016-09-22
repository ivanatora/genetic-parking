window.Car = function(genes){
    this.pos = new Point(car_h/2 + 200, height/2);

    this.maximum_wheel_angle = 30;
    this.current_wheel_angle = 0;
    this.last_wheel_angle = 0;
    this.heading_radians = 0;
    this.delta_angle = 0;
    this.tr = 0;
    
    this.fitness = 1;
    this.is_dead = false;
    
    this.genes = genes || [];
    this.next_genes = [];
    this.update_counter = 0;
    
    this.tire_w = 20;
    this.tire_h = 10;
    
    this.circle_pos = 0;
    
    // draw car body and wheels
    
    this.pos_shape = new Path.Circle(this.pos, 5);
    this.pos_shape.fillColor = 'white';

    this.car_shape = new Path.Rectangle(- car_h/2, - car_w/2, car_h, car_w);
    this.car_shape.fillColor = rgba(0, 0, 0, 0.1);
    this.car_shape.strokeColor = 'green';
    this.car_shape.position = this.pos;


    // wheels
    this.front_shape = new Path.Rectangle(0, 0, this.tire_w, this.tire_h);
    this.front_shape.fillColor = rgba(255, 0, 0, 0.5);
    this.front_shape.strokeColor = 'green';
    this.front_shape.position.x = this.pos.x - axis_h/2 * cos(this.heading_radians);
    this.front_shape.position.y = this.pos.y - axis_h/2 * sin(this.heading_radians);
    this.front_shape.rotate(degrees(this.heading_radians));
    this.front_shape.rotate(this.current_wheel_angle);


    this.back_shape = new Path.Rectangle(0, 0, this.tire_w, this.tire_h);
    this.back_shape.fillColor = rgba(0, 0, 0, 0.1);
    this.back_shape.strokeColor = 'green';
    this.back_shape.position.x = this.pos.x + axis_h/2 * cos(this.heading_radians);
    this.back_shape.position.y = this.pos.y + axis_h/2 * sin(this.heading_radians);
    this.back_shape.rotate(degrees(this.heading_radians));
    
    
    this.tr_shape = new Path.Circle(new Point(0, 0), 1);
    this.tr_shape.strokeColor = 'green';
    
    this.radius_line = new Path.Line(0, 0);
    this.radius_line.strokeColor = 'green';
    this.radius_line.dashArray = [10, 10];
    
//    this.new_pos_shape = new Path.Circle(new Point(0, 0), 10);
    this.new_pos_shape = new Path.Circle(new Point(0, 0), 3);
    this.new_pos_shape.fillColor = 'pink';
    
    this.new_back_shape = new Path.Circle(new Point(0, 0), 5);
    this.new_back_shape.fillColor = 'green';
    
    
    this.update = function(){
        if (this.is_dead) return;

        
        
        this.front_shape.rotate(-this.last_wheel_angle);
//        this.last_heading = this.heading;
        this.car_shape.rotate(degrees(-this.heading_radians));
        
        this.front_shape.rotate(degrees(-this.heading_radians));
        this.back_shape.rotate(degrees(-this.heading_radians));
        
        
        this.car_shape.position = this.pos;
        this.pos_shape.position = this.pos;

        // get new iteration parameter
        var impulse;
        if (this.genes.length > 0 && this.genes.length > this.update_counter){
            impulse = this.genes[this.update_counter];
        }
        else {
            impulse = Math.random() * 10 - 5; // random rotation
        }
        // impulse = -10;
        this.next_genes.push(impulse); // save for further generations
        
        // this.current_wheel_angle = Math.min(this.maximum_wheel_angle, Math.max(-this.maximum_wheel_angle, this.current_wheel_angle + impulse));
        this.current_wheel_angle += impulse;
        if (this.current_wheel_angle > this.maximum_wheel_angle) this.current_wheel_angle = this.maximum_wheel_angle;
        if (this.current_wheel_angle < -this.maximum_wheel_angle) this.current_wheel_angle = -this.maximum_wheel_angle;

        this.last_wheel_angle = this.current_wheel_angle;
        
        // calculate turning radius and travelled arc length
        this.tr = axis_h / Math.abs(sin(radians(this.current_wheel_angle)));
        // var turning_circle_len = abs(PI * 2 * this.tr);
        var arc_angle = 10 / this.tr; // 20 is default
        if (this.current_wheel_angle < 0) arc_angle = - arc_angle;

        this.tr += car_w / 2;


        var radius_center = null;
        // radius_center = this.back_shape.position.clone().subtract(this.front_shape.position.clone()).rotate(-90);
        radius_center = this.back_shape.position.subtract(this.front_shape.position)//.rotate(-90);

        if (this.current_wheel_angle > 0) {
            radius_center = radius_center.rotate(-90);
        }
        else {
            radius_center = radius_center.rotate(90);
        }
        radius_center.length = this.tr;
        radius_center = radius_center.add(this.back_shape.position.clone())
        console.log('back_shape', this.back_shape.position, 'radius_center', radius_center)
        
        
        this.tr_shape.position = radius_center;
        var tmp_r = this.tr_shape.bounds.width / 2;
        this.tr_shape.scale(this.tr / tmp_r);
        
        
        this.radius_line.segments[0].point = radius_center;
        this.radius_line.segments[1].point = this.back_shape.position;
        
        var cntr_to_pos = this.pos.clone().subtract(radius_center);
        var cntr_to_back = this.back_shape.position.clone().subtract(radius_center);
        console.log('cntr_to_back.angle', cntr_to_back.angle, 'arc_angle in degrees', degrees(arc_angle))

        var new_arc_angle_radians = cntr_to_back.angleInRadians - arc_angle;
        // new_arc_angle_radians = arc_angle;
        console.log('new_arc_angle_radians = cntr_to_back.angleInRadians - arc_angle', new_arc_angle_radians, cntr_to_back.angleInRadians, arc_angle);
        if (this.current_wheel_angle > 0){
            // new_arc_angle_radians = new_arc_angle_radians + PI;
        }
        else {
           // new_arc_angle_radians = new_arc_angle_radians + PI/2;

        }


        console.log('finally new_arc_angle_radians', new_arc_angle_radians)
        new_back = new Point(
            radius_center.x + this.tr * cos(new_arc_angle_radians),
            radius_center.y + this.tr * sin(new_arc_angle_radians));

        var cntr_to_new_back = new_back.clone().subtract(radius_center);
        console.log('new back angle', cntr_to_new_back.angle)
        
        // this.heading_radians += arc_angle;
        this.heading_radians = cntr_to_new_back.angleInRadians// - PI/2;
        if (this.current_wheel_angle > 0){
            this.heading_radians -= PI/2;
        }
        else {
            this.heading_radians += PI/2;
        }

        console.log('new heading_radians', this.heading_radians, ' in degrees', degrees(this.heading_radians))
        
        // new_pos = this.pos.clone().subtract(this.back_shape.position.clone().subtract(new_back));
        // new_pos.rotate(-degrees(new_arc_angle_radians), new_back);

        new_pos = new Point(
            new_back.x - axis_h/2 * cos(this.heading_radians),
            new_back.y - axis_h/2 * sin(this.heading_radians));

        console.log('new_pos', new_pos);
        this.new_pos_shape.position = new_pos;
        
        this.new_back_shape.position = new_back;

        
        this.front_shape.rotate(this.current_wheel_angle);
        this.car_shape.rotate(degrees(this.heading_radians));
        this.car_shape.position = new_pos;
        this.front_shape.position.x = this.car_shape.position.x - axis_h/2 * cos(this.heading_radians);
        this.front_shape.position.y = this.car_shape.position.y - axis_h/2 * sin(this.heading_radians);
        this.front_shape.rotate(degrees(this.heading_radians));
        this.back_shape.position.x = this.car_shape.position.x + axis_h/2 * cos(this.heading_radians);
        this.back_shape.position.y = this.car_shape.position.y + axis_h/2 * sin(this.heading_radians);
        this.back_shape.rotate(degrees(this.heading_radians));
        
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
