import {Client} from './client.model';
import {size} from 'underscore';

export enum Direction {
  ASC, DESC
}

export interface PageFilter {
  columnName: string;
  direction: Direction;
  value?: unknown;
}

export class Page<T> {

  constructor({data = [], filter = [], size = 0, current = 0}: {
    data?: Array<T>,
    filter?: Array<PageFilter>,
    size?: number,
    current?: number
  }) {
    this.data = data;
    this.filters = filter;
    this.size = size;
    this.current = current;
  }

  data: Array<T>;
  filters: Array<PageFilter>;
  size: number;
  current: number;
}
