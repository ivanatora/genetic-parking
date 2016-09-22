window.Obstacle = function(pos, w, h){
    this.pos = pos;
    this.w = w;
    this.h = h;
    this.shape = new Path.Rectangle(this.pos.x, this.pos.y, this.w, this.h);
    this.shape.fillColor = 'red';
    
    // this.show = function(){
    //     stroke(255);
    //     fill(255, 0, 0);
    //     rect(this.pos.x + this.w/2, this.pos.y + this.h/2, this.w, this.h);
    // }
}
