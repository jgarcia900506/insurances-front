import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'booleanAsStatus'
})
export class BooleanAsStatusPipe implements PipeTransform {

  transform(value: boolean, assertTextTrue: string = 'Activo', assertTextFalse: string = 'Inactivo'): string {
    return value? assertTextTrue : assertTextFalse;
  }

}
