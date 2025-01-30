import {User} from './user.model';

export class Client {

  constructor({id = 0, name = '', lastname= '', dni = '', email= '', phone = '', user}: {
    id?: number;
    name?: string;
    lastname?: string;
    dni: string;
    email?: string;
    phone?: string;
    user?: User;
  }) {
    this.id = id;
    this.name = name;
    this.lastname = lastname;
    this.dni = dni;
    this.email = email;
    this.phone = phone;
    this.user = user;
  }

  id?: number;
  dni?: string;
  name?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  user?: User;
}
