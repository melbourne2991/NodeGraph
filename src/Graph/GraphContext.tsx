import * as React from 'react';
import { Point } from './types';

export const GraphContext = React.createContext();
export type GetSVGCoords = (point: Point) => Point;

export interface GraphContextProps {
  getSVGCoords: GetSVGCoords;
}

export function withGraphContextPC<T>(
  Component: React.ComponentType<T & GraphContextProps>
): React.ComponentType<T> {
  return class extends React.PureComponent<T> {
    render() {
      return (
        <GraphContext.Consumer>
          {(getSVGCoords: GetSVGCoords) => (
            <Component getSVGCoords={getSVGCoords} {...this.props} />
          )}
        </GraphContext.Consumer>
      );
    }
  };
}
