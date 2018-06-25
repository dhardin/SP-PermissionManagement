Vue.component('console', {
  template: '#console',
  props: {
    isSaving: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    saveProgress: {
      type: Number,
      default: 0
    },
    messages: {
      type: Array,
      default: []
    }
  },
  data: function(){
    return {
    };
  },
  watch: {
    messages: function (newMessages, oldMessages) {
      var elem = this.$refs.consoleMessages;
      elem.scrollTop = elem.scrollHeight;
    }
  },
  methods: {
    clear: function(){
      this.$emit('clear-console');
    },
    getClassObject: function(item){
      return {
        'green--text text--accent-3': item.type == 'success',
        'red--text text--accent-1': item.type =='error',
        'yellow--text text--accent-2': item.type == 'warning',
        'blue--text text--lighten-4': item.type == 'info'
      }
    }
  }
});
