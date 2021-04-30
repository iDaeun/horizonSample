import {AfterViewInit, Component, OnInit} from '@angular/core';
import {NetworkTopologyService} from './network-topology.service';

declare var horizon: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit{

  public topologyData: string;

  constructor(private service: NetworkTopologyService) {
    this.topologyData = this.service.getJSON();
  }

  ngOnInit(): void {
    // if($('#networktopology').length === 0) {
    //   return;
    // }
    // horizon.networktopologyloader.model
    horizon.networktopologycommon.topologyData = this.topologyData;
  }

  ngAfterViewInit(): void {
    console.log('horizon', horizon);
    if (typeof horizon.network_topology !== 'undefined') {
      // load data
      horizon.networktopologycommon.init();

      // load svg (flatTopologyCanvasContainer) : TOPOLOGY
      horizon.flat_network_topology.init();

      // load svg (topologyCanvasContainer) : GRAPH
      // horizon.network_topology.init();
    } else {
      // load data
      horizon.networktopologycommon.init();

      // load svg (flatTopologyCanvasContainer) : TOPOLOGY
      horizon.flat_network_topology.init();

      // load svg (topologyCanvasContainer) : GRAPH
      // horizon.network_topology.init();
    }
  }
}
