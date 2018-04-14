import update from 'immutability-helper';
import {
  GraphState,
  GraphEventPayload,
  GraphEventHandlers,
  DraggingNodeState,
  DraggingLineState
} from './types';

export const graphEventHandlers: GraphEventHandlers = {
  dragstart: (
    graphState: GraphState,
    payload: GraphEventPayload<'dragstart'>
  ) => {
    return update(graphState, {
      interactionStates: {
        draggingNode: {
          $set: {
            nodeId: payload.nodeId,
            last: payload.position
          }
        }
      }
    });
  },

  mouseup: (graphState: GraphState, payload: GraphEventPayload<'mouseup'>) => {
    const { draggingNode, draggingLine } = graphState.interactionStates;

    const updatedState = {
      interactionStates: {
        draggingNode: {},
        draggingLine: {}
      }
    };

    if (draggingNode) {
      updatedState.interactionStates.draggingNode = {
        $set: null
      };
    }

    if (draggingLine) {
      updatedState.interactionStates.draggingLine = {
        $set: null
      };
    }

    return update(graphState, updatedState);
  },

  mousemove: (
    graphState: GraphState,
    payload: GraphEventPayload<'mousemove'>
  ) => {
    const draggingNode = graphState.interactionStates.draggingNode;
    const draggingLine = graphState.interactionStates.draggingLine;

    if (draggingNode) {
      return handleDraggingNode(
        graphState,
        payload,
        draggingNode as DraggingNodeState
      );
    }

    if (draggingLine) {
      return handleDraggingLine(
        graphState,
        payload,
        draggingLine as DraggingLineState
      );
    }

    return graphState;
  },

  mousedownport: (
    graphState: GraphState,
    payload: GraphEventPayload<'mousedownport'>
  ) => {
    const port = graphState.ports[payload.portId];
    const node = graphState.nodes[payload.nodeId];

    const snapbox = {
      extents: port.extents,
      position: {
        x: node.position.x + port.localPosition.x,
        y: node.position.y + port.localPosition.y
      }
    };

    return update(graphState, {
      interactionStates: {
        draggingLine: {
          $set: {
            from: {
              port,
              connectionPoint: snapbox
            },
            to: {
              connectionPoint: snapbox
            }
          }
        }
      }
    });
  }
};

function handleDraggingLine(
  graphState: GraphState,
  payload: GraphEventPayload<'mousemove'>,
  draggingLine: DraggingLineState
): GraphState {
  return update(graphState, {
    interactionStates: {
      draggingLine: {
        to: {
          connectionPoint: {
            $set: {
              x: payload.x,
              y: payload.y
            }
          }
        }
      }
    }
  });
}

function handleDraggingNode(
  graphState: GraphState,
  payload: GraphEventPayload<'mousemove'>,
  draggingNode: DraggingNodeState
): GraphState {
  const node = graphState.nodes[draggingNode.nodeId];

  const diffX = draggingNode.last.x - payload.x;
  const diffY = draggingNode.last.y - payload.y;

  const x = node.position.x - diffX;
  const y = node.position.y - diffY;

  return update(graphState, {
    interactionStates: {
      draggingNode: {
        last: {
          $set: {
            x: payload.x,
            y: payload.y
          }
        }
      }
    },

    nodes: {
      [draggingNode.nodeId]: {
        position: {
          $set: {
            x,
            y
          }
        }
      }
    }
  });
}
