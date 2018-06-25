var select_helper = {
  methods: {
    selectItem: function(item, index){
      this.$emit('select-item', this.type, item, index);
    },
    clearSelected: function(e){
       this.$emit('clear-selected', this.type);
    },
    giveSelected: function(e){
           this.$emit('give-selected', this.type);
    },
    giveAll: function(e){
        this.$emit('give-all', this.type);
    }
    }
  };
