function Population(cnt){
    this.cnt = cnt;
    this.initial_lifespan = 300;
    this.lifespan = this.initial_lifespan;
    
    this.members = [];
    this.new_members = [];
    this.mating_pool = [];
    this.last_mating_pool = [];
    
    for (var i = 0; i < this.cnt; i++){
        this.members.push(new Car());
    }
    
    this.update = function(){
        cnt_dead = 0;
        for (var i = 0; i < this.members.length; i++){
//            this.members[i].applyForce([random(0, 0.1), 0]);
            this.members[i].update();
            if (this.members[i].is_dead) cnt_dead++;
        }

        // don't wait til the end of lifespan, if all members are dead
        if (this.members.length == cnt_dead){
            this.lifespan = 0;
        }
    }
    
    this.show = function(){
        for (var i = 0; i < this.members.length; i++){
            this.members[i].show();
        }
    }
    
    this.evaluate = function(){
        $('#fitnesses').empty();
        $('#fitnesses').append('<tr><th>Car</th><th>Fitness</th></tr>');

        var sum_fitness = 0;
        for (var i = 0; i < this.members.length; i++){
            this.members[i].evaluate();
            sum_fitness += this.members[i].fitness;
        }
        $('.sum_fitness').html(sum_fitness);
        $('.average_fitness').html(sum_fitness / this.members.length);

        if (sum_fitness > current_record) current_record = sum_fitness;
        
        this.mating_pool = [];
        for (var i = 0; i < this.members.length; i++){
            $('#fitnesses').append('<tr><td>#'+i+': </td><td>'+this.members[i].fitness+'</td></tr>');
            if (this.members[i].fitness > 0){
                var allowed_pool_slots = Math.floor(this.members[i].fitness / 10);
                for (var j = 0; j < allowed_pool_slots; j++){
                    this.mating_pool.push(this.members[i].next_genes);
                }
            }
        }
        console.log('end of crossover with mating pool', this.mating_pool)
        
    }
    
    this.crossover = function(){
        this.new_members = [];
        for (i = 0; i < this.cnt; i++){
            var next_genes = [];
            var idxA = Math.round(Math.random() * this.mating_pool.length)
            var idxB = Math.round(Math.random() * this.mating_pool.length)
            var parentA = this.mating_pool[idxA];
            var parentB = this.mating_pool[idxB];
            if (typeof parentA == 'undefined' || typeof parentB == 'undefined') return;
            
            var longer_parent, shorter_parent;
            if (parentA.length > parentB.length){
                longer_parent = parentA;
                shorter_parent = parentB;
            }
            else {
                longer_parent = parentB;
                shorter_parent = parentA;
            }
            
            var split_mid = Math.round(Math.random() * shorter_parent.length);
            for (var j = 0; j < split_mid; j++){
                next_genes[j] = parentA[j];
                if (Math.random() * 100 < iMutationRate){
                    //@TODO: mutation
                }
            }
            for (var j = split_mid; j < longer_parent.length; j++){
                if (typeof parentB[j] != 'undefined'){
                    next_genes[j] = parentB[j];
                }
                else {
                    next_genes[j] = longer_parent[j];
                }
                
                if (Math.random() * 100 < iMutationRate){
                    //@TODO: mutation
                }
            }
            if (Math.random() * 100 < iMutationRate){
                var gene_idx = Math.round(Math.random() * next_genes.length);
                var gene_value = Math.random() * 20 - 10;
                next_genes[gene_idx] = gene_value;
            }

//            console.log('elected genes', next_genes)
            
            this.new_members.push(new Car(next_genes));
        }
    }

    this.purge = function(){
        for (var i = 0; i < this.members.length; i++){
            this.members[i].remove();
        }

        this.members = this.new_members;
    }
    
    this.resurrect = function(){
        this.lifespan = this.initial_lifespan;
    }
}
