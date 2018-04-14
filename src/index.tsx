import './app.css';
import * as React from 'react';
import { render } from 'react-dom';
import { Graph } from './Graph';
import { GraphState, GraphEvent } from './Graph/types';
import { Node } from './Graph/node';

interface AppState {
  graphState: GraphState;
}

class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);

    const graphState = Graph.AddNodes(Graph.CreateEmptyState(), [
      {
        width: 100,
        height: 100,
        position: {
          x: 0,
          y: 0
        },
        ports: [
          {
            localPosition: {
              x: 10,
              y: 10
            },
            extents: 10
          },

          {
            localPosition: {
              x: 90,
              y: 90
            },
            extents: 10
          }
        ]
      },

      {
        width: 100,
        height: 100,
        position: {
          x: 0,
          y: 0
        },
        ports: []
      },

      {
        width: 100,
        height: 100,
        position: {
          x: 0,
          y: 0
        },
        ports: []
      },

      {
        width: 100,
        height: 100,
        position: {
          x: 0,
          y: 0
        },
        ports: []
      }
    ]);

    this.state = {
      graphState
    };

    this.onChange = this.onChange.bind(this);
  }

  onChange(graphState: GraphState) {
    this.setState({ graphState });
  }

  render() {
    const { graphState } = this.state;

    return <Graph onChange={this.onChange} graphState={graphState} />;
  }
}

render(<App />, document.getElementById('root'));
