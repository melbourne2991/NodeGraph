import * as React from 'react';
import {
  GraphProps,
  GraphState,
  GraphEvent,
  GraphNodeConfig,
  NodePort,
  GraphNode,
  Point
} from './types';
import update from 'immutability-helper';
import { graphEventHandlers } from './GraphEventHandlers';
import { FlexLine } from './FlexLine';
import * as uniqid from 'uniqid';
import { GraphContext } from './GraphContext';
import { Node } from './node';

export class Graph extends React.PureComponent<GraphProps> {
  static UpdateGraphState(
    graphState: GraphState,
    event: GraphEvent<any>
  ): GraphState {
    const { eventName, payload } = event;
    return graphEventHandlers[eventName](graphState, payload);
  }

  static CreateEmptyState(): GraphState {
    return {
      nodes: {},
      ports: {},
      nodeIds: [],
      portIds: [],
      interactionStates: {
        draggingNode: null,
        draggingLine: null
      }
    };
  }

  static AddNodes(
    graphState: GraphState,
    nodes: GraphNodeConfig[]
  ): GraphState {
    const nodeIds: string[] = [];
    const portIds: string[] = [];

    const portsUpdate = {};
    const nodesUpdate = {};

    nodes.forEach(({ ports, ...node }) => {
      const nodeId = uniqid();
      nodeIds.push(nodeId);

      const nodeUpdate: GraphNode = {
        id: nodeId,
        portIds: [],
        ...node
      };

      ports.forEach(port => {
        const portId = uniqid();
        nodeUpdate.portIds.push(portId);
        portIds.push(portId);

        const portUpdate: NodePort = {
          id: portId,
          nodeId,
          ...port
        };

        portsUpdate[portId] = portUpdate;
      });

      nodesUpdate[nodeId] = nodeUpdate;
    });

    return update(graphState, {
      nodes: {
        $set: nodesUpdate
      },
      ports: {
        $set: portsUpdate
      },
      nodeIds: { $push: nodeIds },
      portIds: { $push: portIds }
    });
  }

  rootSvg: SVGSVGElement;
  rootSvgPoint: SVGPoint;

  constructor(props: GraphProps) {
    super(props);

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.rootSvgRef = this.rootSvgRef.bind(this);
    this.getSVGCoords = this.getSVGCoords.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  rootSvgRef(el: SVGSVGElement | null) {
    if (el) {
      this.rootSvg = el;
      this.rootSvgPoint = this.rootSvg.createSVGPoint();
    }
  }

  getSVGCoords({ x, y }: Point): Point {
    const pt = this.rootSvgPoint;
    const svg = this.rootSvg;

    pt.x = x;
    pt.y = y;

    // The cursor point, translated into svg coordinates
    // https://stackoverflow.com/questions/29261304/how-to-get-the-click-coordinates-relative-to-svg-element-holding-the-onclick-lis
    var cursorPoint = pt.matrixTransform(svg.getScreenCTM().inverse());
    return cursorPoint;
  }

  onMouseMove(e: React.MouseEvent<SVGElement>) {
    const point = this.getSVGCoords({ x: e.clientX, y: e.clientY });

    this.onChange({
      eventName: 'mousemove',
      payload: point
    });
  }

  onMouseUp(e: React.MouseEvent<SVGElement>) {
    this.onChange({
      eventName: 'mouseup',
      payload: undefined
    });
  }

  onChange(event: GraphEvent<any>) {
    const updatedState = Graph.UpdateGraphState(this.props.graphState, event);
    this.props.onChange(updatedState);
  }

  renderNodes() {
    const { graphState } = this.props;

    console.log(graphState);

    return graphState.nodeIds.map(nodeId => {
      const node = graphState.nodes[nodeId];

      const nodeProps = {
        ...node,
        ports: node.portIds.map(portId => {
          return graphState.ports[portId];
        })
      };

      return <Node {...nodeProps} onChange={this.onChange} />;
    });
  }

  renderDrawLine() {
    const { graphState: { interactionStates: { draggingLine } } } = this.props;

    if (draggingLine) {
      return (
        <FlexLine
          a={draggingLine.from.connectionPoint}
          b={draggingLine.to.connectionPoint}
        />
      );
    }

    return null;
  }

  render() {
    return (
      <GraphContext.Provider value={this.getSVGCoords}>
        <svg
          ref={this.rootSvgRef}
          onMouseMove={this.onMouseMove}
          onMouseUp={this.onMouseUp}
          width="1000"
          height="1000"
          viewBox="0 0 1000 1000"
          xmlns="http://www.w3.org/2000/svg"
        >
          {this.renderNodes()}
          {this.renderDrawLine()}
        </svg>
      </GraphContext.Provider>
    );
  }
}
