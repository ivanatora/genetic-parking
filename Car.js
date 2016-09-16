window.Car = function(genes){
    this.pos = new Point(car_h/2 + 200, height/2);
    this.acc = new Point(0, 0);
    this.vel = new Point(0, 0);
    
//    this.maximum_wheel_angle = 30;
    this.maximum_wheel_angle = 30;
    this.current_wheel_angle = 0;
    this.car_angle = 0;
    this.tr = 0;
    
    this.color = new Color(Math.random() * 255, Math.random() * 255, Math.random() * 255);
    
    this.fitness = 1; 
    this.is_dead = false;
    
    this.genes = genes || [];
    this.next_genes = [];
    this.update_counter = 0
    
    this.tire_w = 20;
    this.tire_h = 10;
    this.dfb = 20; // distance front bumper -> front axle
    this.dra = this.dfb + axis_h; // distance front bumper -> rare axle
    this.drb = car_h - this.dra; // distance rare bumper -> rare axle
    this.rac = 0; // rare axle center
    
    this.circle_pos = 0;
    
    // draw car body and wheels
    
    var pos_shape = new Path.Circle(this.pos, 5);
    pos_shape.fillColor = 'white';

    var car_body = new Path.Rectangle(- car_h / 2, - car_w/2, car_h, car_w);
    car_body.fillColor = rgba(0, 0, 0, 0.1);
    car_body.strokeColor = 'green';
    car_body.position = this.pos;


    var front_up = new Path.Rectangle(0, 0, this.tire_w, this.tire_h);
    front_up.fillColor = rgba(255, 0, 0, 0.5);
    front_up.strokeColor = 'green';
    front_up.rotate(this.current_wheel_angle);
    front_up.position.x = this.pos.x - car_h/2 + this.dfb;
    front_up.position.y = this.pos.y - car_w/2;

    var front_down = new Path.Rectangle(0, 0, this.tire_w, this.tire_h);
    front_down.fillColor = rgba(255, 0, 0, 0.5);
    front_down.strokeColor = 'green';
    front_down.rotate(this.current_wheel_angle);
    front_down.position.x = this.pos.x - car_h/2 + this.dfb;
    front_down.position.y = this.pos.y + car_w/2;

    var rare_up = new Path.Rectangle(0, 0, this.tire_w, this.tire_h);
    rare_up.fillColor = rgba(0, 0, 0, 0.1);
    rare_up.strokeColor = 'green';
    rare_up.position.x = this.pos.x + car_h/2 - this.drb;
    rare_up.position.y = this.pos.y - car_w/2;

    var rare_down = new Path.Rectangle(0, 0, this.tire_w, this.tire_h);
    rare_down.fillColor = rgba(0, 0, 0, 0.1);
    rare_down.strokeColor = 'green';
    rare_down.position.x = this.pos.x + car_h/2 - this.drb;
    rare_down.position.y = this.pos.y + car_w/2;
    
    rare_a = this.pos.clone();
    rare_a.x = car_h / 2 - this.drb;
    rare_a.y = -car_w / 2;

    rare_b = this.pos.clone();
    rare_b.x = car_h / 2 - this.drb;
    rare_b.y = car_w / 2;
    
    tr_shape = new Path.Circle(0, 1);
    tr_shape.strokeColor = 'green';
    
    radius_axle_line = new Path.Line(0, 0);
    radius_axle_line.strokeColor = 'green';
    
    rare_axle_line = new Path.Line(0, 0);
    rare_axle_line.strokeColor = rgb(255, 0, 255);
    
    radius_line = new Path.Line(0, 0);
    radius_line.strokeColor = 'green';
    
    new_rac_shape = new Path.Circle(0, 1);
    new_rac_shape.strokeColor = rgba(0, 0, 255, 100);
    
    new_pos_shape = new Path.Circle(0, 1);
    new_pos_shape.strokeColor = rgba(0, 255, 0, 100);
    
    rac_shape = new Path.Circle(0, 1);
    rac_shape.fillColor = 'red';
    
    this.update = function(){
        if (this.is_dead) return;
        
        // reset wheel angles
        front_up.rotate(-this.current_wheel_angle);
        front_down.rotate(-this.current_wheel_angle);
        
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

        console.log('current_wheel_angle', this.current_wheel_angle)
        front_up.rotate(this.current_wheel_angle);
        front_down.rotate(this.current_wheel_angle);
        
        
        this.tr = axis_h / sin(radians(this.current_wheel_angle));
        turning_circle_len = abs(PI * 2 * this.tr);
        arc_angle = 1 / this.tr;
//            console.log('angle is', this.current_wheel_angle, 'radius is', this.tr, 'circle len is', turning_circle_len, 'arc angle', degrees(arc_angle))

        this.circle_pos = this.pos.clone();
        this.circle_pos.length = this.tr;
        //console.log('pos', this.pos, 'circle', circle_pos)

        rare_a.x = this.pos.x + car_h/2 - this.drb;
        rare_a.y = this.pos.y - car_w/2;
        rare_b.x = this.pos.x + car_h/2 - this.drb;
        rare_b.y = this.pos.y + car_w/2;
        rare_a.rotate(this.car_angle, this.pos);
        rare_b.rotate(this.car_angle, this.pos);
        
        axle_a_b = rare_b.clone().subtract(rare_a)
        axle_a_b.length = - this.tr;
        this.tr += car_w / 2;
        radius_center = rare_a.clone().add(axle_a_b);
        
        //tr_shape = new Path.Circle(radius_center, this.tr);
        tr_shape.position = radius_center;
        var tmp_r = tr_shape.bounds.width / 2;
        tr_shape.scale(this.tr / tmp_r);
        

//        radius_axle_line = new Path.Line(rare_a, radius_center);
        radius_axle_line.segments[0].point = rare_a;
        radius_axle_line.segments[1].point = radius_center;


//        rare_axle_line = new Path.Line(rare_a, rare_b);// turning radius trough the rare axle // debug - OK
        rare_axle_line.segments[0].point = rare_a;
        rare_axle_line.segments[1].point = rare_b;
        
        
        // center of rare axle
        this.rac = new Point(car_h/2 - this.drb, 0);
        this.rac.rotate(this.car_angle)
        this.rac.add(this.pos)

        // get vector to vehicle center
        center_translated = radius_center.add(this.pos);
//        console.log(radius_line)
//        radius_line.segments[0] = center_translated;
//        radius_line.segments[1] = this.pos;
        

        cntr_to_pos = this.pos.clone().subtract(center_translated);
        cntr_to_rac = this.rac.clone().subtract(center_translated);
//            console.log('cntr_to_pos = ', cntr_to_pos, 'heading ', cntr_to_pos.angleInRadians, 'arc_angle', arc_angle)

        if (this.current_wheel_angle > 0){
            new_arc_angle = cntr_to_rac.angleInRadians - 20 * arc_angle;
            new_rac = new Point(center_translated.x + this.tr * cos(new_arc_angle), center_translated.y + this.tr * sin(new_arc_angle));
        }
        else {
            new_arc_angle = cntr_to_rac.angleInRadians - 20 * arc_angle + PI;
            new_rac = new Point(center_translated.x + this.tr * cos(new_arc_angle), center_translated.y + this.tr * sin(new_arc_angle));
        }
//        console.log('new angle', degrees(PI/2 - new_arc_angle), 'old angle', degrees(arc_angle));
        
//        new_rac_shape = new Path.Circle(new_rac, 5);
        tmp_r = new_rac_shape.bounds.width / 2;
        new_rac_shape.position = new_rac;
        new_rac_shape.scale(5/tmp_r);
        
        

        new_pos = this.pos.clone().subtract(this.rac.clone().subtract(new_rac))
//        new_pos_shape = new Path.Circle(new_pos, 5);
        tmp_r = new_pos_shape.bounds.width / 2;
        new_pos_shape.position = new_pos;
        new_pos_shape.scale(2/tmp_r);
//        this.pos = new_pos;

//        this.car_angle += PI/2 - new_arc_angle;
        this.car_angle += new_arc_angle;
        
        
        newrac_to_rac = this.rac.clone().subtract(new_rac);
        newrac_to_rac.rotate(this.car_angle);
        this.pos.subtract(newrac_to_rac)
        

//        var rac_shape = new Path.Circle(this.rac, 5);
        tmp_r = rac_shape.bounds.width / 2;
        rac_shape.position = this.rac;
        rac_shape.scale(2/tmp_r);

        
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
