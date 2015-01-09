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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvb2Jhci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBLHNEQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQSxNQUFBLEdBQVcsRUFBWCxDQUFBOztBQUFBLEVBQ0EsUUFBQSxHQUFXLElBRFgsQ0FBQTs7QUFJQSxFQUFBLElBQWdCLFFBQWhCO0FBQUEsSUFBQSxNQUFBLEdBQVMsQ0FBQSxFQUFULENBQUE7R0FKQTs7QUFBQSxFQU9BLE1BQUEsR0FBUyxTQUFDLENBQUQsR0FBQTtXQUFPLENBQUEsR0FBSSxFQUFYO0VBQUEsQ0FQVCxDQUFBOztBQUFBLEVBVUEsSUFBQSxHQUFPLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsQ0FWUCxDQUFBOztBQUFBLEVBYUEsSUFBQSxHQUNFO0FBQUEsSUFBQSxJQUFBLEVBQVEsSUFBSSxDQUFDLElBQWI7QUFBQSxJQUNBLE1BQUEsRUFBUSxNQURSO0FBQUEsSUFFQSxJQUFBLEVBQVEsU0FBQyxDQUFELEdBQUE7YUFBTyxDQUFBLEdBQUksTUFBQSxDQUFPLENBQVAsRUFBWDtJQUFBLENBRlI7R0FkRixDQUFBOztBQUFBLEVBbUJBLElBQUEsR0FBTyxTQUFBLEdBQUE7QUFDTCxRQUFBLGVBQUE7QUFBQSxJQURNLHVCQUFRLGlFQUNkLENBQUE7V0FBQSxLQUFBLENBQU0sTUFBTixFQUFjLE9BQWQsRUFESztFQUFBLENBbkJQLENBQUE7O0FBdUJBLEVBQUEsSUFBc0IsOENBQXRCO0FBQUEsSUFBQSxLQUFBLENBQU0sWUFBTixDQUFBLENBQUE7R0F2QkE7O0FBQUEsRUEwQkEsS0FBQTs7QUFBUztTQUFBLDJDQUFBO3FCQUFBO0FBQUEsb0JBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFWLEVBQUEsQ0FBQTtBQUFBOztNQTFCVCxDQUFBO0FBQUEiLCJmaWxlIjoiZm9vYmFyLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiIyBBc3NpZ25tZW50OlxubnVtYmVyICAgPSA0Mlxub3Bwb3NpdGUgPSB0cnVlXG5cbiMgQ29uZGl0aW9uczpcbm51bWJlciA9IC00MiBpZiBvcHBvc2l0ZVxuXG4jIEZ1bmN0aW9uczpcbnNxdWFyZSA9ICh4KSAtPiB4ICogeFxuXG4jIEFycmF5czpcbmxpc3QgPSBbMSwgMiwgMywgNCwgNV1cblxuIyBPYmplY3RzOlxubWF0aCA9XG4gIHJvb3Q6ICAgTWF0aC5zcXJ0XG4gIHNxdWFyZTogc3F1YXJlXG4gIGN1YmU6ICAgKHgpIC0+IHggKiBzcXVhcmUgeFxuXG4jIFNwbGF0czpcbnJhY2UgPSAod2lubmVyLCBydW5uZXJzLi4uKSAtPlxuICBwcmludCB3aW5uZXIsIHJ1bm5lcnNcblxuIyBFeGlzdGVuY2U6XG5hbGVydCBcIkkga25ldyBpdCFcIiBpZiBlbHZpcz9cblxuIyBBcnJheSBjb21wcmVoZW5zaW9uczpcbmN1YmVzID0gKG1hdGguY3ViZSBudW0gZm9yIG51bSBpbiBsaXN0KSJdfQ==