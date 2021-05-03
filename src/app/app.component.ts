import {AfterViewInit, Component, OnInit} from '@angular/core';
import {NetworkTopologyService} from './network-topology.service';
import {TopologyModel} from './topology.model';

declare var horizon: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit{

  public topologyData: TopologyModel;

  constructor(private service: NetworkTopologyService) {
    this.topologyData = this.service.getTopologyData();
  }

  ngOnInit(): void {
    horizon.networktopologycommon.topologyData = this.topologyData;
  }

  ngAfterViewInit(): void {
    // load data
    horizon.networktopologycommon.init();
    // load svg (flatTopologyCanvasContainer) : TOPOLOGY
    horizon.flat_network_topology.init();
  }
}
