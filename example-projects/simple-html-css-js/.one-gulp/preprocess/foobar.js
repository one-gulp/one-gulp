(function() {
  var cubes, list, math, num, number, opposite, race, square,
    __slice = [].slice;

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
    winner = arguments[0], runners = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return print(winner, runners);
  };

  if (typeof elvis !== "undefined" && elvis !== null) {
    alert("I knew it!");
  }

  cubes = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = list.length; _i < _len; _i++) {
      num = list[_i];
      _results.push(math.cube(num));
    }
    return _results;
  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvb2Jhci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBLHNEQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQSxNQUFBLEdBQVcsRUFBWCxDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLElBRFgsQ0FBQTs7QUFJQSxFQUFBLElBQWdCLFFBQWhCO0FBQUEsSUFBQSxNQUFBLEdBQVMsQ0FBQSxFQUFULENBQUE7R0FKQTs7QUFBQSxFQU9BLE1BQUEsR0FBUyxTQUFDLENBQUQsR0FBQTtXQUFPLENBQUEsR0FBSSxFQUFYO0VBQUEsQ0FQVCxDQUFBOztBQUFBLEVBU0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxFQUFaLENBVEEsQ0FBQTs7QUFBQSxFQVlBLElBQUEsR0FBTyxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLENBWlAsQ0FBQTs7QUFBQSxFQWVBLElBQUEsR0FDRTtBQUFBLElBQUEsSUFBQSxFQUFRLElBQUksQ0FBQyxJQUFiO0FBQUEsSUFDQSxNQUFBLEVBQVEsTUFEUjtBQUFBLElBRUEsSUFBQSxFQUFRLFNBQUMsQ0FBRCxHQUFBO2FBQU8sQ0FBQSxHQUFJLE1BQUEsQ0FBTyxDQUFQLEVBQVg7SUFBQSxDQUZSO0dBaEJGLENBQUE7O0FBQUEsRUFxQkEsSUFBQSxHQUFPLFNBQUEsR0FBQTtBQUNMLFFBQUEsZUFBQTtBQUFBLElBRE0sdUJBQVEsaUVBQ2QsQ0FBQTtXQUFBLEtBQUEsQ0FBTSxNQUFOLEVBQWMsT0FBZCxFQURLO0VBQUEsQ0FyQlAsQ0FBQTs7QUF5QkEsRUFBQSxJQUFzQiw4Q0FBdEI7QUFBQSxJQUFBLEtBQUEsQ0FBTSxZQUFOLENBQUEsQ0FBQTtHQXpCQTs7QUFBQSxFQTRCQSxLQUFBOztBQUFTO1NBQUEsMkNBQUE7cUJBQUE7QUFBQSxvQkFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQVYsRUFBQSxDQUFBO0FBQUE7O01BNUJULENBQUE7QUFBQSIsImZpbGUiOiJmb29iYXIuanMiLCJzb3VyY2VSb290Ijoic291cmNlIiwic291cmNlc0NvbnRlbnQiOlsiIyBBc3NpZ25tZW50OlxubnVtYmVyICAgPSA0Mlxub3Bwb3NpdGUgPSB0cnVlXG5cbiMgQ29uZGl0aW9uczpcbm51bWJlciA9IC00MiBpZiBvcHBvc2l0ZVxuXG4jIEZ1bmN0aW9uczpcbnNxdWFyZSA9ICh4KSAtPiB4ICogeFxuXG5jb25zb2xlLmxvZyg0MilcblxuIyBBcnJheXM6XG5saXN0ID0gWzEsIDIsIDMsIDQsIDVdXG5cbiMgT2JqZWN0czpcbm1hdGggPVxuICByb290OiAgIE1hdGguc3FydFxuICBzcXVhcmU6IHNxdWFyZVxuICBjdWJlOiAgICh4KSAtPiB4ICogc3F1YXJlIHhcblxuIyBTcGxhdHM6XG5yYWNlID0gKHdpbm5lciwgcnVubmVycy4uLikgLT5cbiAgcHJpbnQgd2lubmVyLCBydW5uZXJzXG5cbiMgRXhpc3RlbmNlOlxuYWxlcnQgXCJJIGtuZXcgaXQhXCIgaWYgZWx2aXM/XG5cbiMgQXJyYXkgY29tcHJlaGVuc2lvbnM6XG5jdWJlcyA9IChtYXRoLmN1YmUgbnVtIGZvciBudW0gaW4gbGlzdCkiXX0=