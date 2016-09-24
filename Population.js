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

    this.setPopulationSize = function(n){
        this.cnt = n;
    }
    
    this.update = function(){
        cnt_dead = 0;
        for (var i = 0; i < this.members.length; i++){
//            this.members[i].applyForce([random(0, 0.1), 0]);
            this.members[i].update();
            this.members[i].evaluate();
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
        var $fitnesses = $('#fitnesses');
        $fitnesses.empty();
        $fitnesses.append('<tr><th>Car</th><th>Fitness</th><th>Mating slots</th><th>Angle penalty</th></tr>');

        var sum_fitness = 0;
        for (var i = 0; i < this.members.length; i++){
            // this.members[i].evaluate();
            sum_fitness += this.members[i].max_fitness;
        }
        $('.sum_fitness').html(sum_fitness);
        $('.average_fitness').html(sum_fitness / this.members.length);

        if (sum_fitness > current_record) current_record = sum_fitness;

        // stretch population fitness to 0-100 range
        var min_fitness = 100;
        for (var i = 0; i < this.members.length; i++){
            if (this.members[i].max_fitness < min_fitness) min_fitness = this.members[i].max_fitness;
        }
        // console.log('min fitness is', min_fitness)
        for (var i = 0; i < this.members.length; i++){
            this.members[i].allowed_mating_slots = map(this.members[i].max_fitness, min_fitness, 100, 0, 100);
            this.members[i].allowed_mating_slots = Math.ceil(this.members[i].allowed_mating_slots / 10);
            this.members[i].allowed_mating_slots += 1; // make sure everyone has at least one slot
                // console.log(i, 'allowed slots', this.members[i].allowed_mating_slots)
        }
        
        this.mating_pool = [];
        for (var i = 0; i < this.members.length; i++){
            $fitnesses.append('<tr><td>#'+i+': </td><td>'+this.members[i].max_fitness+'</td><td>'+
                this.members[i].allowed_mating_slots+'</td><td>-'+this.members[i].heading_penalty+'</td></tr>');

            for (var j = 0; j < this.members[i].allowed_mating_slots; j++){
                this.mating_pool.push(this.members[i].next_genes);
            }
        }
        $fitnesses.append('<tr><td>M. pool</td><td>'+this.mating_pool.length+'</td></tr>');
        if (this.mating_pool.length == 0){
            // console.log('empty pool', this.members)
            run = false;
        }

    }
    
    this.crossover = function(){
        this.new_members = [];
        // console.log('begin to cross, and pool is', this.mating_pool.length)
        // for (var i = 0; i < this.cnt; i++){
        for (var i = 0; this.new_members.length < this.cnt; i++){
            var next_genes = [];
            var idxA = Math.floor(Math.random() * this.mating_pool.length)
            var idxB = Math.floor(Math.random() * this.mating_pool.length)
            var parentA = this.mating_pool[idxA];
            var parentB = this.mating_pool[idxB];
            if (typeof parentA == 'undefined' || typeof parentB == 'undefined') {
                console.log('cant select parent:', idxA, idxB, this.mating_pool)
                break;
            }
            
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
            }
            for (var j = split_mid; j < longer_parent.length; j++){
                if (typeof parentB[j] != 'undefined'){
                    next_genes[j] = parentB[j];
                }
                else {
                    next_genes[j] = longer_parent[j];
                }
            }

            // mutation
            if (Math.random() * 100 < iMutationRate){
                var gene_idx = Math.round(Math.random() * next_genes.length);
                var gene_value = Math.random() * 20 - 10;
                // console.log('Mutation! gene', gene_idx, 'from', next_genes[gene_idx], 'to', gene_value)
                next_genes[gene_idx] = gene_value;
            }

            if (i == 0){
                // lets give the 0th member a set of fresh genes
                next_genes = [];
            }

            this.new_members.push(new Car(next_genes));
        }
    }

    this.purge = function(){
        for (var i = 0; i < this.members.length; i++){
            this.members[i].remove();
        }

        if (this.new_members.length == 0){
            run = false;
            console.log('NO NEW MEMBERS')
        }

        this.members = this.new_members;
        // console.log('purge, new members:', this.members.length)
    }
    
    this.resurrect = function(){
        this.lifespan = this.initial_lifespan;
    }
}
