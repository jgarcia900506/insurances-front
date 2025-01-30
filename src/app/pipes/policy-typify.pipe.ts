import { Pipe, PipeTransform } from '@angular/core';

export enum Types {
  LIFE = 'Vida',
  CAR = 'Auto',
  HEALT = 'Salud',
  HOME = 'Hogar'
}

@Pipe({
  name: 'policyTypify'
})
export class PolicyTypifyPipe implements PipeTransform {

  transform(key: string): string {
    return Types[key as keyof typeof Types];
  }

}
