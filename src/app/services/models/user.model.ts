import {AuthorityModel} from './authority.model';

export interface User {
  id: number;
  username: string;
  authorities: Array<AuthorityModel>;
}
