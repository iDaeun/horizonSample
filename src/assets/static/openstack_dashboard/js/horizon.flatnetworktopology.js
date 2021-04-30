/**
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

/* global Hogan */
/* Namespace for core functionality related to Network Topology. */

horizon.flat_network_topology = {
  model: null,
  fa_globe_glyph: '\uf0ac',
  fa_globe_glyph_width: 15,
  svg:'#topology_canvas',
  svg_container:'#flatTopologyCanvasContainer',
  network_tmpl:{
    small:'#topology_template > .network_container_small',
    normal:'#topology_template > .network_container_normal'
  },
  router_tmpl: {
    small:'#topology_template > .router_small',
    normal:'#topology_template > .router_normal'
  },
  instance_tmpl: {
    small:'#topology_template > .instance_small',
    normal:'#topology_template > .instance_normal'
  },
  balloon_tmpl : null,
  balloon_device_tmpl : null,
  balloon_port_tmpl : null,
  network_index: {},
  balloon_id:null,
  reload_duration: 10000,
  draw_mode:'small',
  network_height : 0,
  previous_message : null,
  element_properties:{
    normal:{
      network_width:270,
      network_min_height:500,
      top_margin:80,
      default_height:50,
      margin:20,
      device_x:98.5,
      device_width:90,
      port_margin:16,
      port_height:6,
      port_width:82,
      port_text_margin:{x:6,y:-4},
      texts_bg_y:32,
      type_y:46,
      balloon_margin:{x:12,y:-12}
    },
    small :{
      network_width:100,
      network_min_height:400,
      top_margin:50,
      default_height:20,
      margin:30,
      device_x:47.5,
      device_width:20,
      port_margin:5,
      port_height:3,
      port_width:32.5,
      port_text_margin:{x:0,y:0},
      texts_bg_y:0,
      type_y:0,
      balloon_margin:{x:12,y:-30}
    },
    cidr_margin:5,
    device_name_max_size:9,
    device_name_suffix:'..'
  },

  init:function() {
    var self = this;
    self.$container = $(self.svg_container);
    self.color = d3.scale.category10();
    self.load_network_info();
  },

  load_network_info:function(){
    var self = this;

    // *** model = 데이터
    self.model = JSON.parse(horizon.networktopologyloader.model);
    self.data_convert();
  },
  select_draw_mode:function() {
    var self = this;
    var draw_mode = 'small'; // *** 작음 : 'small' , 표준 : 'normal'
    try {
      draw_mode = horizon.cookies.get('ntp_draw_mode');
    }
    catch(e) {
      // if the cookie does not exist, angular-cookie passes "undefined" to
      // JSON.parse which throws an exception
    }

    if (draw_mode && (draw_mode === 'normal' || draw_mode === 'small')) {
      self.draw_mode = draw_mode;
    } else {
      if (self.model.networks.length *
        self.element_properties.normal.network_width > $('#topologyCanvas').width()) {
        self.draw_mode = 'small';
      } else {
        self.draw_mode = 'normal';
      }
      horizon.cookies.put('ntp_draw_mode',self.draw_mode);
    }
    $('.toggle-view > .btn').each(function(){
      var $this = $(this);
      if($this.data('value') === self.draw_mode) {
        $this.addClass('active');
      } else {
        $this.removeClass('active');
      }
    });
  },
  data_convert:function() {
    var self = this;
    // *** model 포맷 : JSON { servers : [], networks : [], ports : [], routers : [] }
    var model = self.model;
    $.each(model.networks, function(index, network) {
      self.network_index[network.id] = index;
    });
    self.select_draw_mode();
    var element_properties = self.element_properties[self.draw_mode];
    self.network_height = element_properties.top_margin;
    $.each([
      {model:model.routers, type:'router'},
      {model:model.servers, type:'instance'}
    ], function(index, devices) {
      var type = devices.type;
      var model = devices.model;
      $.each(model, function(index, device) {
        device.type = type;
        device.ports = self.select_port(device.id);
        var hasports = device.ports.length > 0;
        device.parent_network = (hasports) ? self.select_main_port(device.ports).network_id : self.model.networks[0].id;
        var height = element_properties.port_margin*(device.ports.length - 1);
        device.height = (self.draw_mode === 'normal' && height > element_properties.default_height) ? height : element_properties.default_height;
        device.pos_y = self.network_height;
        device.port_height = (self.draw_mode === 'small' && height > device.height) ? 1 : element_properties.port_height;
        device.port_margin = (self.draw_mode === 'small' && height > device.height) ? device.height/device.ports.length : element_properties.port_margin;
        self.network_height += device.height + element_properties.margin;
      });
    });
    $.each(model.networks, function(index, network) {
      network.devices = [];
      $.each([model.routers, model.servers],function(index, devices) {
        $.each(devices,function(index, device) {
          if(network.id === device.parent_network) {
            network.devices.push(device);
          }
        });
      });
    });
    self.network_height += element_properties.top_margin;
    self.network_height = (self.network_height > element_properties.network_min_height) ? self.network_height : element_properties.network_min_height;
    self.draw_topology();
  },
  draw_topology:function() {
    var self = this;
    $(self.svg_container).removeClass('noinfo');
    if (self.model.networks.length <= 0) {
      $('g.network').remove();
      $(self.svg_container).addClass('noinfo');
      return;
    }
    var svg = d3.select(self.svg);
    var element_properties = self.element_properties[self.draw_mode];
    svg
      .attr('width',self.model.networks.length*element_properties.network_width)
      .attr('height',self.network_height);

    var network = svg.selectAll('g.network')
      .data(self.model.networks);

    network.enter()
      .append('g')
      .attr('class','network')
      .each(function(d){
        this.appendChild(d3.select(self.network_tmpl[self.draw_mode]).node().cloneNode(true));
        var $this = d3.select(this).select('.network-rect');
        if (d.url) {
          $this
            .on('mouseover',function(){
              $this.transition().style('fill', function() {
                return d3.rgb(self.get_network_color(d.id)).brighter(0.5);
              });
            })
            .on('mouseout',function(){
              $this.transition().style('fill', function() {
                return self.get_network_color(d.id);
              });
            })
            .on('click',function(){
              window.location.href = d.url;
            });
        } else {
          $this.classed('nourl', true);
        }
      });

    network
      .attr('id',function(d) { return 'id_' + d.id; })
      .attr('transform',function(d,i){
        return 'translate(' + element_properties.network_width * i + ',' + 0 + ')';
      })
      .select('.network-rect')
      .attr('height', function() { return self.network_height; })
      .style('fill', function(d) { return self.get_network_color(d.id); });
    network
      .select('.network-name')
      .attr('x', function() { return self.network_height/2; })
      .text(function(d) { return d.name; });
    network
      .select('.network-cidr')
      .attr('x', function(d) {
        var padding = isExternalNetwork(d) ? self.fa_globe_glyph_width : 0;
        return self.network_height - self.element_properties.cidr_margin -
          padding;
      })
      .text(function(d) {
        var cidr = $.map(d.subnets,function(n){
          return n.cidr;
        });
        return cidr.join(', ');
      });
    function isExternalNetwork(d) {
      return d['router:external'];
    }
    network
      .select('.network-type')
      .text(function(d) {
        return isExternalNetwork(d) ? self.fa_globe_glyph : '';
      })
      .attr('x', function() {
        return self.network_height - self.element_properties.cidr_margin;
      });

    network.exit().remove();

    var device = network.selectAll('g.device')
      .data(function(d) { return d.devices; });

    var device_enter = device.enter()
      .append("g")
      .attr('class','device')
      .each(function(d){
        var device_template = self[d.type + '_tmpl'][self.draw_mode];
        this.appendChild(d3.select(device_template).node().cloneNode(true));
      });

    device_enter
      .on('mouseenter',function(d){
      var $this = $(this);
      // TODO 말풍선 표시
      // self.show_balloon(d,$this);
    })
      .on('click',function(){
        d3.event.stopPropagation();
      });

    device
      .attr('id',function(d) { return 'id_' + d.id; })
      .attr('transform',function(d){
        return 'translate(' + element_properties.device_x + ',' + d.pos_y + ')';
      })
      .select('.frame')
      .attr('height',function(d) { return d.height; });
    device
      .select('.texts_bg')
      .attr('y',function(d) {
        return element_properties.texts_bg_y + d.height - element_properties.default_height;
      });
    device
      .select('.type')
      .attr('y',function(d) {
        return element_properties.type_y + d.height - element_properties.default_height;
      });

    var port = device.select('g.ports')
      .selectAll('g.port')
      .data(function(d) { return d.ports; });

    var port_enter = port.enter()
      .append('g')
      .attr('class','port')
      .attr('id',function(d) { return 'id_' + d.id; });

    port_enter
      .append('line')
      .attr('class','port_line');

    // *** 아이콘 옆에 port 번호 표시
    // port_enter
    //   .append('text')
    //   .attr('class','port_text');

    device.select('g.ports').each(function(d){
      this._portdata = {};
      this._portdata.ports_length = d.ports.length;
      this._portdata.parent_network = d.parent_network;
      this._portdata.device_height = d.height;
      this._portdata.port_height = d.port_height;
      this._portdata.port_margin = d.port_margin;
      this._portdata.left = 0;
      this._portdata.right = 0;
      $(this).mouseenter(function(e){
        e.stopPropagation();
      });
    });

    port.each(function(d){
      var index_diff = self.get_network_index(this.parentNode._portdata.parent_network) -
        self.get_network_index(d.network_id);
      this._index_diff = index_diff = (index_diff >= 0)? ++index_diff : index_diff;
      this._direction = (this._index_diff < 0)? 'right' : 'left';
      this._index = this.parentNode._portdata[this._direction] ++;

    });

    port.attr('transform',function(){
      var x = (this._direction === 'left') ? 0 : element_properties.device_width;
      var ports_length = this.parentNode._portdata[this._direction];
      var distance = this.parentNode._portdata.port_margin;
      var y = (this.parentNode._portdata.device_height -
        (ports_length -1)*distance)/2 + this._index*distance;
      return 'translate(' + x + ',' + y + ')';
    });

    port
      .select('.port_line')
      .attr('stroke-width',function() {
        return this.parentNode.parentNode._portdata.port_height;
      })
      .attr('stroke', function(d) {
        return self.get_network_color(d.network_id);
      })
      .attr('x1',0).attr('y1',0).attr('y2',0)
      .attr('x2',function() {
        var parent = this.parentNode;
        var width = (Math.abs(parent._index_diff) - 1)*element_properties.network_width +
          element_properties.port_width;
        return (parent._direction === 'left') ? -1*width : width;
      });

    port
      .select('.port_text')
      .attr('x',function() {
        var parent = this.parentNode;
        if (parent._direction === 'left') {
          d3.select(this).classed('left',true);
          return element_properties.port_text_margin.x*-1;
        } else {
          d3.select(this).classed('left',false);
          return element_properties.port_text_margin.x;
        }
      })
      .attr('y',function() {
        return element_properties.port_text_margin.y;
      })
      .text(function(d) {
        var ip_label = [];
        $.each(d.fixed_ips, function() {
          ip_label.push(this.ip_address);
        });
        return ip_label.join(',');
      });

    port.exit().remove();
  },
  get_network_color: function(network_id) {
    return this.color(this.get_network_index(network_id));
  },
  get_network_index: function(network_id) {
    return this.network_index[network_id];
  },
  select_port: function(device_id){
    return $.map(this.model.ports,function(port){
      if (port.device_id === device_id) {
        return port;
      }
    });
  },
  select_main_port: function(ports){
    var _self = this;
    var main_port_index = 0;
    var MAX_INT = 4294967295;
    var min_port_length = MAX_INT;
    $.each(ports, function(index, port){
      var port_length = _self.sum_port_length(port.network_id, ports);
      if(port_length < min_port_length){
        min_port_length = port_length;
        main_port_index = index;
      }
    });
    return ports[main_port_index];
  },
  sum_port_length: function(network_id, ports){
    var self = this;
    var sum_port_length = 0;
    var base_index = self.get_network_index(network_id);
    $.each(ports, function(index, port){
      sum_port_length += base_index - self.get_network_index(port.network_id);
    });
    return sum_port_length;
  },
};
