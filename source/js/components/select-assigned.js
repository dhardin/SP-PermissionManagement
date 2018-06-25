Vue.component('select-assigned', {
  template:'#select-assigned',
  mixins: [select_helper],
    props:{
      assignedItems: {
        type: Array
      },
      isSaving: {
        type: Boolean,
        default: false
      },
      isSiteCollectionSelected: {
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
      searchAssigned: '',
      type: 'assigned'
    };
  }
});
