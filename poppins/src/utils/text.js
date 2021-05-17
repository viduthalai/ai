const Text = (function() {
  return {
    commaJoiner: function(list, finalJoiner) {
      var firstFew = list.slice(0, list.length - 1).join(", ")
      return firstFew ? firstFew + finalJoiner + list[list.length - 1] : list[list.length - 1];
    }
  };
})();

export default Text;