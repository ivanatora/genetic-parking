function Car(genes){
    this.pos = createVector(car_h/2 + 200, height/2);
    this.acc = createVector(0, 0);
    this.vel = createVector(0, 0);
    
//    this.maximum_wheel_angle = 30;
    this.maximum_wheel_angle = 30;
    this.current_wheel_angle = 0;
    this.car_angle = 0;
    this.tr = 0;
    
    this.color = color(random(255), random(255), random(255));
    
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
    
    
    this.applyForce = function(force){
        this.acc.add(force);
    }
    
    this.update = function(){
        strokeWeight(1)
        if (this.is_dead) return;
        
        var impulse;
        
        if (this.genes.length > 0 && this.genes.length > this.update_counter){
            impulse = this.genes[this.update_counter];
        }
        else {
            impulse = random(-5, 5); // random rotation
            //impulse = random(0, 5); // random rotation
//            impulse = 1;
        }
        this.next_genes.push(impulse); // save for further generations
        
        this.current_wheel_angle = constrain(this.current_wheel_angle + impulse, -this.maximum_wheel_angle, this.maximum_wheel_angle);
        this.current_wheel_angle = 20;
        
        // impulse. ...
        
        if (this.update_counter == 0){
//            this.applyForce([1, 0]);
        }
        
//            this.vel.rotate(radians(impulse));
//        this.car_angle = -radians(this.current_wheel_angle);

        this.tr = axis_h / sin(radians(this.current_wheel_angle));
        turning_circle_len = abs(PI * 2 * this.tr);
        arc_angle = 1 / this.tr;
//            console.log('angle is', this.current_wheel_angle, 'radius is', this.tr, 'circle len is', turning_circle_len, 'arc angle', degrees(arc_angle))

        circle_pos = this.pos.copy();
        circle_pos.setMag(this.tr)
//            line(this.pos.x, this.pos.y, circle_pos.x, circle_pos.y)
        //console.log('pos', this.pos, 'circle', circle_pos)

        rare_a = this.pos.copy();
        rare_a.x = car_h / 2 - this.drb;
        rare_a.y = -car_w / 2;

        rare_b = this.pos.copy();
        rare_b.x = car_h / 2 - this.drb;
        rare_b.y = car_w / 2;

        push();
            translate(this.pos.x, this.pos.y);
            rare_a.rotate(this.car_angle);
            rare_b.rotate(this.car_angle);
            axle_a_b = rare_b.copy().sub(rare_a)
            axle_a_b.setMag(this.tr).mult(-1);
            this.tr += car_w / 2;
            radius_center = rare_a.copy().add(axle_a_b);
            ellipse(radius_center.x, radius_center.y, this.tr*2, this.tr*2) // turning circle
            line(rare_a.x, rare_a.y, radius_center.x, radius_center.y)

            stroke(255, 0, 255);
            line(rare_a.x, rare_a.y, rare_b.x, rare_b.y) // turning radius trough the rare axle // debug - OK
        pop();
        
        // center of rare axle
        this.rac = createVector(car_h/2 - this.drb, 0);
        this.rac.rotate(this.car_angle)
        this.rac.add(this.pos)

        // get vector to vehicle center
        center_translated = radius_center.add(this.pos);
        line(center_translated.x, center_translated.y , this.pos.x, this.pos.y) // radius to the vehicle center // debug - OK

        cntr_to_pos = this.pos.copy().sub(center_translated);
        cntr_to_rac = this.rac.copy().sub(center_translated);
//            console.log('cntr_to_pos = ', cntr_to_pos, 'heading ', cntr_to_pos.heading(), 'arc_angle', arc_angle)
//            line(0, 0, cntr_to_pos.x, cntr_to_pos.y)


        if (this.current_wheel_angle > 0){
            new_arc_angle = cntr_to_rac.heading() - 20 * arc_angle;
            new_rac = createVector(center_translated.x + this.tr * cos(new_arc_angle), center_translated.y + this.tr * sin(new_arc_angle));
        }
        else {
            new_arc_angle = cntr_to_rac.heading() - 20 * arc_angle + PI;
            new_rac = createVector(center_translated.x + this.tr * cos(new_arc_angle), center_translated.y + this.tr * sin(new_arc_angle));
        }
        console.log('new angle', degrees(PI/2 - new_arc_angle), 'old angle', degrees(arc_angle));
        
        fill(0, 0, 255, 100);
        ellipse(new_rac.x, new_rac.y, 10, 10)// target rac - blue

        new_pos = this.pos.copy().sub(this.rac.copy().sub(new_rac))
        fill(0, 255, 0, 100);
        ellipse(new_pos.x, new_pos.y, 10, 10) // green filled new_pos
//        this.pos = new_pos;

//        this.car_angle += PI/2 - new_arc_angle;
        this.car_angle += new_arc_angle;
        
        
        newrac_to_rac = this.rac.copy().sub(new_rac);
        newrac_to_rac.rotate(this.car_angle);
        console.log('r', this.rac, 'nr', new_rac)
        this.pos.sub(newrac_to_rac)
        

        push(); // draw this.rac
        fill(255, 0, 0);
        ellipse(this.rac.x, this.rac.y, 10, 10); // red filled this.rac
        pop();


        
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
        
        fill(255);
        ellipse(this.pos.x, this.pos.y, 10, 10);
        noFill();
            
        push();
//            translate(20, 20);
            translate(this.pos.x, this.pos.y);
            rotate(this.car_angle)

            fill(0, 0, 0, 100);
            rect(0, 0, car_h, car_w);

            // front up
            push();
                fill(255, 0, 0, 100);
                push();
                    translate(this.dfb - car_h/2, -car_w/2);
                    rotate(radians(this.current_wheel_angle));
                    rect(0, 0, this.tire_w, this.tire_h);
                pop();

                // front down
                push();
                    translate(this.dfb - car_h/2, +car_w/2);
                    rotate(radians(this.current_wheel_angle))
                    rect(0, 0, this.tire_w, this.tire_h);
                pop();

            pop();

            // rare 
            push();
                translate(this.dra - car_h/2, -car_w/2);
                rect(0, 0, this.tire_w, this.tire_h);
                rect(0, car_w, this.tire_w, this.tire_h);
            pop();
        
        pop();
    }
    
    this.hits = function(obstacle){
        
    }
}
