import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Client} from '../../../../services/models/client.model';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {Page} from '../../../../services/models/page.model';
import {Policy} from '../../../../services/models/policy.model';
import {AsyncPipe, CurrencyPipe, DatePipe, NgForOf, NgIf} from '@angular/common';
import {FormControl, FormGroup, FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {PolicyService} from '../../../../services/policy.service';
import {BooleanAsStatusPipe} from '../../../../pipes/boolean-as-status.pipe';
import {NgbModal, NgbModalConfig} from '@ng-bootstrap/ng-bootstrap';
import {PolicyTypifyPipe, Types} from '../../../../pipes/policy-typify.pipe';
import * as _ from 'underscore';

@Component({
  selector: 'app-policy-grid',
  imports: [
    AsyncPipe,
    FormsModule,
    NgForOf,
    NgIf,
    BooleanAsStatusPipe,
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    PolicyTypifyPipe
  ],
  templateUrl: './policy-grid.component.html',
  styleUrl: './policy-grid.component.scss'
})
export class PolicyGridComponent implements  OnInit, OnDestroy {

  private _clientSubject: Subject<number> = new Subject<number>();

  private _pageSubject: BehaviorSubject<Page<Policy>> = new BehaviorSubject(new Page({}));
  page$: Observable<Page<Policy>> = this._pageSubject.asObservable();

  private _client: Client = {};

  private _filterInputSubject = new Subject<void>();
  filterInput: FormControl;

  editForm: FormGroup;
  typeKeys: Array<string> = Object.keys(Types);

  @Input()
  get client(): Client {
    return this._client;
  }
  set client(client: Client) {
    if(client.id) {
      this._clientSubject.next(client.id);
    }
    this._client = client;
  }

  constructor(
    config: NgbModalConfig,
    private _modalService: NgbModal,
    private _fb: FormBuilder,
    private _service: PolicyService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;

    const rg = /\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])/;
    this.filterInput = new FormControl('');
    this.editForm = this._fb.group({
      id: [0],
      type: [this.typeKeys[0], [Validators.required]],
      effectiveStartDate: ['', [Validators.required, Validators.pattern(rg)]],
      effectiveEndDate: ['', [Validators.required, Validators.pattern(rg)]],
      insuredAmount: [0, [Validators.required]],
    });

    this._clientSubject.subscribe((clientId) => {
      this._service.fetchAllFor(clientId).then((result) => {
        const page: Page<Policy> = new Page({data: result});
        this._pageSubject.next(page);
      });
    });
  }

  ngOnInit(): void {
  }

  onEdit(content: unknown, policy: Policy | null): void {
    const {id, type, effectiveStartDate, effectiveEndDate, insuredAmount} = policy? policy : {
      id: 0,
      type: this.typeKeys[0],
      effectiveStartDate: '',
      effectiveEndDate: '',
      insuredAmount: 0,
    };

    this.editForm.setValue({id, type, effectiveStartDate, effectiveEndDate, insuredAmount});
    this.editForm.enable();

    this._modalService.open(content);
  }

  onRemove(content: unknown, policy: Policy): void {
    const {id, type, effectiveStartDate, effectiveEndDate, insuredAmount} = policy;

    this.editForm.setValue({id, type, effectiveStartDate, effectiveEndDate, insuredAmount});
    this.editForm.disable();

    this._modalService.open(content);
  }

  onSelect(policy: Policy) {
    if(policy.id) {
      const clientId: number | undefined = this.client.id;
      if(clientId) {
        this._service.disableOne(policy.id, clientId);

        _.delay(() => {
          const page: Page<Policy> = new Page({data: this._service.useBackup(clientId)});
          this._pageSubject.next(page);
        }, 500);
      }
    }
  }

  onSubmitChange(): void {
    const change: Policy = this.editForm.value;

    if(this.editForm.disabled) {
      if(change && change.id){
        this._service.removeOne(change.id);
      }
    } else {
      this._service.merge(change, this.client);
    }

    _.delay(() => {
      const clientId: number | undefined = this.client.id;
      if(clientId) {
        const page: Page<Policy> = new Page({data: this._service.useBackup(clientId)});
        this._pageSubject.next(page);
      }
    }, 500);
    this._modalService.dismissAll();
  }

  ngOnDestroy(): void {
    this._clientSubject.subscribe();
  }

}
