(function() {
  var cubes, list, math, num, number, opposite, race, square,
    slice = [].slice;

  number = 42;

  opposite = true;

  if (opposite) {
    number = -42;
  }

  square = function(x) {
    return x * x;
  };

  console.log(42);

  list = [1, 2, 3, 4, 5];

  math = {
    root: Math.sqrt,
    square: square,
    cube: function(x) {
      return x * square(x);
    }
  };

  race = function() {
    var runners, winner;
    winner = arguments[0], runners = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return print(winner, runners);
  };

  if (typeof elvis !== "undefined" && elvis !== null) {
    alert("I knew it!");
  }

  cubes = (function() {
    var i, len, results;
    results = [];
    for (i = 0, len = list.length; i < len; i++) {
      num = list[i];
      results.push(math.cube(num));
    }
    return results;
  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvb2Jhci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBLHNEQUFBO0lBQUEsZ0JBQUE7O0FBQUEsRUFBQSxNQUFBLEdBQVcsRUFBWCxDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLElBRFgsQ0FBQTs7QUFJQSxFQUFBLElBQWdCLFFBQWhCO0FBQUEsSUFBQSxNQUFBLEdBQVMsQ0FBQSxFQUFULENBQUE7R0FKQTs7QUFBQSxFQU9BLE1BQUEsR0FBUyxTQUFDLENBQUQsR0FBQTtXQUFPLENBQUEsR0FBSSxFQUFYO0VBQUEsQ0FQVCxDQUFBOztBQUFBLEVBU0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxFQUFaLENBVEEsQ0FBQTs7QUFBQSxFQVlBLElBQUEsR0FBTyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLENBWlAsQ0FBQTs7QUFBQSxFQWVBLElBQUEsR0FDRTtBQUFBLElBQUEsSUFBQSxFQUFRLElBQUksQ0FBQyxJQUFiO0FBQUEsSUFDQSxNQUFBLEVBQVEsTUFEUjtBQUFBLElBRUEsSUFBQSxFQUFRLFNBQUMsQ0FBRCxHQUFBO2FBQU8sQ0FBQSxHQUFJLE1BQUEsQ0FBTyxDQUFQLEVBQVg7SUFBQSxDQUZSO0dBaEJGLENBQUE7O0FBQUEsRUFxQkEsSUFBQSxHQUFPLFNBQUEsR0FBQTtBQUNMLFFBQUEsZUFBQTtBQUFBLElBRE0sdUJBQVEsK0RBQ2QsQ0FBQTtXQUFBLEtBQUEsQ0FBTSxNQUFOLEVBQWMsT0FBZCxFQURLO0VBQUEsQ0FyQlAsQ0FBQTs7QUF5QkEsRUFBQSxJQUFzQiw4Q0FBdEI7QUFBQSxJQUFBLEtBQUEsQ0FBTSxZQUFOLENBQUEsQ0FBQTtHQXpCQTs7QUFBQSxFQTRCQSxLQUFBOztBQUFTO1NBQUEsc0NBQUE7b0JBQUE7QUFBQSxtQkFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQVYsRUFBQSxDQUFBO0FBQUE7O01BNUJULENBQUE7QUFBQSIsImZpbGUiOiJmb29iYXIuanMiLCJzb3VyY2VSb290IjoiL3NyYyIsInNvdXJjZXNDb250ZW50IjpbIiMgQXNzaWdubWVudDpcbm51bWJlciAgID0gNDJcbm9wcG9zaXRlID0gdHJ1ZVxuXG4jIENvbmRpdGlvbnM6XG5udW1iZXIgPSAtNDIgaWYgb3Bwb3NpdGVcblxuIyBGdW5jdGlvbnM6XG5zcXVhcmUgPSAoeCkgLT4geCAqIHhcblxuY29uc29sZS5sb2coNDIpXG5cbiMgQXJyYXlzOlxubGlzdCA9IFsxLCAyLCAzLCA0LCA1XVxuXG4jIE9iamVjdHM6XG5tYXRoID1cbiAgcm9vdDogICBNYXRoLnNxcnRcbiAgc3F1YXJlOiBzcXVhcmVcbiAgY3ViZTogICAoeCkgLT4geCAqIHNxdWFyZSB4XG5cbiMgU3BsYXRzOlxucmFjZSA9ICh3aW5uZXIsIHJ1bm5lcnMuLi4pIC0+XG4gIHByaW50IHdpbm5lciwgcnVubmVyc1xuXG4jIEV4aXN0ZW5jZTpcbmFsZXJ0IFwiSSBrbmV3IGl0IVwiIGlmIGVsdmlzP1xuXG4jIEFycmF5IGNvbXByZWhlbnNpb25zOlxuY3ViZXMgPSAobWF0aC5jdWJlIG51bSBmb3IgbnVtIGluIGxpc3QpIl19