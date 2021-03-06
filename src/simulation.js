import {dispatch} from "d3-dispatch";
import {map} from "d3-collection";
import {timer} from "d3-timer";

export function x(d) {
  return d.x;
}

export function y(d) {
  return d.y;
}

var initialRadius = 10,
    initialAngle = Math.PI * (3 - Math.sqrt(5));

export default function(nodes) {
  var simulation,
      iteration = 0,
      alphaMin = 0.0001,
      alphaDecay = -0.02,
      drag = 0.5,
      forces = map(),
      ticker = timer(tick),
      event = dispatch("tick", "end");

  if (nodes == null) nodes = [];

  function start() {
    iteration = 0;
    ticker.restart(tick);
    return simulation;
  }

  function stop() {
    ticker.stop();
    return simulation;
  }

  function tick() {
    var alpha = Math.exp(++iteration * alphaDecay);

    if (!(alpha > alphaMin)) {
      ticker.stop();
      event.call("end", simulation);
      return;
    }

    forces.each(function(force) {
      force(alpha);
    });

    for (var i = 0, n = nodes.length, node; i < n; ++i) {
      node = nodes[i];
      node.x += node.vx *= drag;
      node.y += node.vy *= drag;
    }

    event.call("tick", simulation);
  }

  function initializeNodes() {
    for (var i = 0, n = nodes.length, node; i < n; ++i) {
      node = nodes[i], node.index = i;
      if (isNaN(node.x) || isNaN(node.y)) {
        var radius = initialRadius * Math.sqrt(i), angle = i * initialAngle;
        node.x = radius * Math.cos(angle);
        node.y = radius * Math.sin(angle);
      }
      if (isNaN(node.vx) || isNaN(node.vy)) {
        node.vx = node.vy = 0;
      }
    }
  }

  function initializeForce(force) {
    if (force.initialize) force.initialize(nodes);
    return force;
  }

  initializeNodes();

  return simulation = {
    start: start,
    stop: stop,
    tick: tick,

    nodes: function(_) {
      return arguments.length ? (nodes = _, initializeNodes(), forces.each(initializeForce), simulation) : nodes;
    },

    alphaMin: function(_) {
      return arguments.length ? (alphaMin = _, simulation) : alphaMin;
    },

    alphaDecay: function(_) {
      return arguments.length ? (iteration = +_ ? Math.round(iteration * alphaDecay / -_) : 0, alphaDecay = -_, simulation) : -alphaDecay;
    },

    drag: function(_) {
      return arguments.length ? (drag = 1 - _, simulation) : 1 - drag;
    },

    force: function(name, _) {
      return arguments.length > 1 ? ((_ == null ? forces.remove(name) : forces.set(name, initializeForce(_))), simulation) : forces.get(name);
    },

    on: function(name, _) {
      return arguments.length > 1 ? (event.on(name, _), simulation) : event.on(name);
    }
  };
}
