import {AsyncPipe, CommonModule} from '@angular/common';
import {Component, EventEmitter, HostListener, OnDestroy, OnInit, Output} from '@angular/core';
import {BehaviorSubject, Observable, Subject, debounceTime, map, Subscription} from 'rxjs';
import {ReactiveFormsModule, FormsModule, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'underscore';

import {ClientService} from '../../../../services/client.service';
import {Client} from '../../../../services/models/client.model';
import {Page} from '../../../../services/models/page.model';

@Component({
  selector: 'app-client-grid',
  imports: [
    AsyncPipe,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    ClientService,
    NgbModalConfig,
    NgbModal
  ],
  templateUrl: './client-grid.component.html',
  styleUrl: './client-grid.component.scss'
})
export class ClientGridComponent implements OnInit, OnDestroy {

  @Output() clientSelected: EventEmitter<Client> = new EventEmitter();

  private _pageSubject: BehaviorSubject<Page<Client>> = new BehaviorSubject(new Page({}));
  page$: Observable<Page<Client>> = this._pageSubject.asObservable();

  private _filterInputSubject = new Subject<void>();
  filterInput: FormControl;

  editForm: FormGroup;

  constructor(
    config: NgbModalConfig,
    private _modalService: NgbModal,
    private _fb: FormBuilder,
    private _service: ClientService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;

    this.filterInput = new FormControl('');
    this.editForm = this._fb.group({
      id: [0, []],
      dni: ['', [Validators.required]],
      name: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    });

    this._filterInputSubject.pipe(
      debounceTime(500),
      map((value) => this.filterInput.value)
    ).subscribe({
      next: (value) => {
        const page: Page<Client> = new Page({data: this._service.filter(value)});
        this._pageSubject.next(page);
      }
    });
  }

  ngOnInit() {
    this._service.fetchAll().then(result => {
      const page: Page<Client> = new Page({data: result});
      this._pageSubject.next(page);
    });
  }

  @HostListener('input', ['$event'])
  onFilterInputChange(event: unknown) {
    this._filterInputSubject.next();
  }

  onSelect(client: Client) {
    this.clientSelected.emit(client);
  }

  onEdit(content: unknown, client: Client | null) {
    const {id, name, lastname, dni, email, phone} = client? client : new Client({
      id: 0,
      name: '',
      lastname: '',
      dni: '',
      email: '',
      phone: ''
    });

    this.editForm.setValue({id, name, lastname, dni, email, phone});
    this.editForm.enable();

    this._modalService.open(content);
  }

  onRemove(content: unknown, client: Client) {
    const {id, name, lastname, dni, email, phone} = client;

    this.editForm.setValue({id, name, lastname, dni, email, phone});
    this.editForm.disable();

    this._modalService.open(content);
  }

  onSubmitChange(): void {
    const change: Client = this.editForm.value;

    if(this.editForm.disabled) {
      if(change && change.id){
        this._service.removeOne(change.id);
      }
    } else {
      this._service.merge(change);
    }

    _.delay(() => {
      const page: Page<Client> = new Page({data: this._service.useBackup()});
      this._pageSubject.next(page);
    }, 500);
    this._modalService.dismissAll();
  }

  ngOnDestroy(): void {
    this._pageSubject.unsubscribe();
    this._filterInputSubject.unsubscribe();
  }

}
