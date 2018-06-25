Vue.component('select-available', {
  template:'#select-available',
  mixins: [select_helper],
  props:{
    availableItems: {
      type: Array
    },
    isSaving: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    selectedItem: {

    }
  },
  data: function(){
    return {
      searchAvailable: '',
      type: 'available',
      selected: {}
    };
  },
  methods: {

  }
});
