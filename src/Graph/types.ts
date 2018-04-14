export interface NodeDragEventInitializers {
  dragStart(position: Point): void;
}

export type GraphEventHandlers = {
  [K in keyof GraphEvents]: GraphEventHandler<K, GraphEvents>
};

export interface GraphEvents {
  dragstart: {
    nodeId: string;
    position: Point;
  };
  mousemove: Point;
  mouseup: undefined;
  mousedownport: {
    nodeId: string;
    portId: string;
  };
}

export interface GraphEventHandler<K extends keyof G, G = GraphEvents> {
  (graphState: GraphState, payload: GraphEventPayload<K, G>): GraphState;
}

export type GraphEventPayload<K extends keyof G, G = GraphEvents> = G[K];

export interface GraphEvent<K extends keyof G, G = GraphEvents> {
  eventName: K;
  payload: GraphEventPayload<K, G>;
}

export type GraphNodeConfig = {
  ports: Omit<Omit<NodePort, 'nodeId'>, 'id'>[];
} & Omit<Omit<GraphNode, 'portIds'>, 'id'>;

export interface NodePort {
  id: string;
  nodeId: string;
  localPosition: Point;
  extents: number;
}

export interface GraphNode {
  id: string;
  position: Point;
  width: number;
  height: number;
  portIds: string[];
}

export type ResolvedGraphNode = GraphNode & {
  ports: NodePort[];
};

export interface DraggingNodeState {
  nodeId: string;
  last: Point;
}

export interface DraggingLineState {
  from: {
    port?: NodePort;
    connectionPoint: ConnectionPoint;
  };
  to: {
    port?: NodePort;
    connectionPoint: ConnectionPoint;
  };
}

export interface InteractionStates {
  draggingNode: null | DraggingNodeState;
  draggingLine: null | DraggingLineState;
}

export interface GraphState {
  interactionStates: InteractionStates;
  nodes: {
    [nodeId: string]: GraphNode;
  };
  ports: {
    [portId: string]: NodePort;
  };
  nodeIds: string[];
  portIds: string[];
}

export interface GraphProps {
  graphState: GraphState;
  onChange: (graphState: GraphState) => void;
}

export interface Point {
  x: number;
  y: number;
}

export type OnChange = <K extends keyof GraphEvents>(
  graphEvent: GraphEvent<K>
) => void;

export interface Snapbox {
  position: Point;
  extents: number;
}

export type ConnectionPoint = Point | Snapbox;

export function isSnapbox(obj: {}): boolean {
  return (
    (obj as Snapbox).extents !== undefined &&
    (obj as Snapbox).position !== undefined
  );
}

export type NodeProps = GraphNode & { ports: NodePort[]; onChange: OnChange };

type Diff<T extends string, U extends string> = ({ [P in T]: P } &
  { [P in U]: never } & { [x: string]: never })[T];

export type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;

export type SingleOrArray<Properties, T extends keyof Properties> = {
  [P in T]: Properties[P] | Array<Properties[P]>
};
