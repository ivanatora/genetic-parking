window.Car = function(genes){
    this.pos = new Point(car_h/2 + 200, height/2);
    this.acc = new Point(0, 0);
    this.vel = new Point(0, 0);
    
    this.maximum_wheel_angle = 30;
    this.current_wheel_angle = 0;
    this.car_angle = 0;
    this.prev_car_angle = 0;
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
    this.rac = new Point(axis_h/2, 0);; // rare axle center
    
    this.circle_pos = 0;
    
    // draw car body and wheels
    
    var pos_shape = new Path.Circle(this.pos, 5);
    pos_shape.fillColor = 'white';

    var car_body = new Path.Rectangle(- car_h/2, - car_w/2, car_h, car_w);
    car_body.fillColor = rgba(0, 0, 0, 0.1);
    car_body.strokeColor = 'green';
    car_body.position = this.pos;


    // wheels
    var front_up = new Path.Rectangle(0, 0, this.tire_w, this.tire_h);
    front_up.fillColor = rgba(255, 0, 0, 0.5);
    front_up.strokeColor = 'green';
    front_up.rotate(this.current_wheel_angle);
    front_up.position.x = this.pos.x - axis_h/2;
    front_up.position.y = this.pos.y - car_w/2;


    var rare_up = new Path.Rectangle(0, 0, this.tire_w, this.tire_h);
    rare_up.fillColor = rgba(0, 0, 0, 0.1);
    rare_up.strokeColor = 'green';
    rare_up.position.x = this.pos.x + axis_h/2;
    rare_up.position.y = this.pos.y - car_w/2;
    
    rare_a = this.pos.clone();
    rare_a.x = axis_h/2;
    rare_a.y = -car_w / 2;

    rare_b = this.pos.clone();
    rare_b.x = axis_h/2;
    rare_b.y = car_w / 2;
    
    front_a = this.pos.clone();
    front_a.x = -axis_h/2;
    front_a.y = -car_w / 2;
    
    front_b = this.pos.clone();
    front_b.x = -axis_h/2;
    front_b.y = car_w / 2;
    
    tr_shape = new Path.Circle(new Point(0, 0), 1);
    tr_shape.strokeColor = 'green';
    
    radius_axle_line = new Path.Line(0, 0);
    radius_axle_line.strokeColor = 'green';
    radius_axle_line.dashArray = [5, 5];
    
    rare_axle_line = new Path.Line(0, 0);
    rare_axle_line.strokeColor = rgb(255, 0, 255);
    
    radius_line = new Path.Line(0, 0);
    radius_line.strokeColor = 'green';
    radius_line.dashArray = [10, 10];
    
    new_rac_shape = new Path.Circle(new Point(0, 0), 5);
    new_rac_shape.strokeColor = rgb(0, 0, 255);
    new_rac_shape.fillColor = rgb(0, 0, 255);
    
    new_pos_shape = new Path.Circle(new Point(0, 0), 5);
    new_pos_shape.strokeColor = rgb(0, 255, 0);
    new_pos_shape.fillColor = rgb(0, 255, 0);
    
    rac_shape = new Path.Circle(new Point(0, 0), 5);
    rac_shape.strokeColor = 'red';
    rac_shape.fillColor = 'red';
    
    this.update = function(){
        if (this.is_dead) return;
        
        // reset wheel angles
        front_up.rotate(-this.current_wheel_angle);
        this.prev_car_angle = this.car_angle;
        car_body.position = this.pos;
        pos_shape.position = this.pos;

        // get new iteration parameter
        var impulse;
        if (this.genes.length > 0 && this.genes.length > this.update_counter){
            impulse = this.genes[this.update_counter];
        }
        else {
            impulse = Math.random() * 10 - 5; // random rotation
        }
        this.next_genes.push(impulse); // save for further generations
        
        this.current_wheel_angle = Math.min(this.maximum_wheel_angle, Math.max(-this.maximum_wheel_angle, this.current_wheel_angle + impulse));
//        this.current_wheel_angle = 20;

        
        // calculate turning radius and travelled arc length
        this.tr = axis_h / sin(radians(this.current_wheel_angle));
        turning_circle_len = abs(PI * 2 * this.tr);
        arc_angle = 20 / this.tr; // 20 is default

        this.circle_pos = this.pos.clone();
        this.circle_pos.length = this.tr;

        // calculate part centres
        rare_a.x = this.pos.x + axis_h/2;
        rare_a.y = this.pos.y - car_w/2;
        rare_b.x = this.pos.x + axis_h/2;
        rare_b.y = this.pos.y + car_w/2;
        rare_a.rotate(this.car_angle, this.rac);
        rare_b.rotate(this.car_angle, this.rac);
        
        front_a.x = this.pos.x - axis_h/2;
        front_a.y = this.pos.y - car_w/2;
        front_b.x = this.pos.x - axis_h/2;
        front_b.y = this.pos.y + car_w/2;
        
        axle_a_b = rare_b.clone().subtract(rare_a)
        axle_a_b.length = - this.tr;
        this.tr += car_w / 2;
        radius_center = rare_a.clone().add(axle_a_b);
        
        //tr_shape = new Path.Circle(radius_center, this.tr);
        tr_shape.position = radius_center;
        var tmp_r = tr_shape.bounds.width / 2;
        tr_shape.scale(this.tr / tmp_r);
        

        radius_axle_line.segments[0].point = rare_a;
        radius_axle_line.segments[1].point = radius_center;

        rare_axle_line.segments[0].point = rare_a;
        rare_axle_line.segments[1].point = rare_b;
        
        
        // center of rare axle
        this.rac = new Point(axis_h/2, 0);
        this.rac.rotate(this.car_angle)
        this.rac.x = this.pos.x + axis_h/2;
        this.rac.y += this.pos.y;
        rac_shape.position = this.rac;

        radius_line.segments[0].point = radius_center;
        radius_line.segments[1].point = this.pos;
        
        cntr_to_pos = this.pos.clone().subtract(radius_center);
        cntr_to_rac = this.rac.clone().subtract(radius_center);

        if (this.current_wheel_angle > 0){
            new_arc_angle = cntr_to_rac.angleInRadians - arc_angle;
            new_rac = new Point(radius_center.x + this.tr * cos(new_arc_angle), radius_center.y + this.tr * sin(new_arc_angle));
        }
        else {
            new_arc_angle = cntr_to_rac.angleInRadians - arc_angle + PI;
            new_rac = new Point(radius_center.x + this.tr * cos(new_arc_angle), radius_center.y + this.tr * sin(new_arc_angle));
        }
        
        new_rac_shape.position = new_rac;
        
        new_pos = this.pos.clone().subtract(this.rac.clone().subtract(new_rac))
        new_pos_shape.position = new_pos;

        this.car_angle += new_arc_angle;
        this.delta_angle = this.car_angle - this.prev_car_angle;
        this.delta_angle = -this.delta_angle;
        console.log('car_angle at end', this.car_angle)
        
        car_body.rotate(this.delta_angle);
        car_body.rotate(this.delta_angle, radius_center);
        
        front_up.rotate(this.current_wheel_angle);
        front_up.rotate(this.delta_angle, radius_center)
        rare_up.position = rare_a;
        rare_up.rotate(this.delta_angle, radius_center)
        front_up.position = front_a;
        
        newrac_to_rac = this.rac.clone().subtract(new_rac);
        newrac_to_rac.rotate(this.car_angle);
        this.pos = new_pos;
        
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
