import * as React from 'react';
import { NodePort } from './types';
import { withGraphContextPC, GraphContextProps } from './GraphContext';
import { NodeProps } from './types';

class Node extends React.PureComponent<NodeProps & GraphContextProps> {
  constructor(props: NodeProps & GraphContextProps) {
    super(props);
    this.onMouseDown = this.onMouseDown.bind(this);
  }

  onMouseDown(e: React.MouseEvent<SVGRectElement>) {
    this.props.onChange({
      eventName: 'dragstart',
      payload: {
        nodeId: this.props.id,
        position: this.props.getSVGCoords({ x: e.clientX, y: e.clientY })
      }
    });
  }

  onMouseDownPort(port: NodePort, e: React.MouseEvent<SVGRectElement>) {
    this.props.onChange({
      eventName: 'mousedownport',
      payload: {
        nodeId: this.props.id,
        portId: port.id
      }
    });
  }

  renderPorts() {
    const { ports, position } = this.props;

    return ports.map(port => {
      const { extents } = port;
      const size = extents * 2;

      return (
        <rect
          onMouseDown={this.onMouseDownPort.bind(this, port)}
          x={position.x + port.localPosition.x - extents}
          y={position.y + port.localPosition.y - extents}
          width={size}
          height={size}
          strokeWidth={1}
          stroke={'red'}
        />
      );
    });
  }

  render() {
    const { position, width, height } = this.props;

    return (
      <g>
        <rect
          x={position.x}
          y={position.y}
          onMouseDown={this.onMouseDown}
          width={width}
          height={height}
        />
        {this.renderPorts()}
      </g>
    );
  }
}

const NodeWithContext = withGraphContextPC<NodeProps>(Node);
export { NodeWithContext as Node };
