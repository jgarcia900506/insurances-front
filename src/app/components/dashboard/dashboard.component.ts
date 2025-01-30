import {Component, OnInit, OnDestroy} from '@angular/core';
import {ClientGridComponent} from './grids/client-grid/client-grid.component';
import {PolicyGridComponent} from './grids/policy-grid/policy-grid.component';
import {Client} from '../../services/models/client.model';



@Component({
  selector: 'app-dashboard',
  imports: [
    ClientGridComponent,
    PolicyGridComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {

  selectedClient: Client = {};

  constructor() {

  }

  ngOnInit(): void {
  }

  onManageClient(client: Client) {
    this.selectedClient = client;
  }

  ngOnDestroy(): void {
  }

}
