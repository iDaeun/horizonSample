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

// Aggregate for common network topology functionality
horizon.networktopologycommon = {
  topologyData: null,

  init: function () {
    horizon.networktopologyloader.init();
  }
};

/**
 * Common data loader for network topology views
 */
horizon.networktopologyloader = {
  // data for the network topology views
  model: null,
  // timeout length
  reload_duration: 10000,
  // timer controlling update intervals
  update_timer: null,

  init: function () {
    var self = this;
    if (horizon.networktopologycommon.topologyData === null) {
      return;
    }
    self.update();
  },

  /**
   * makes the data request and populates the 'model'
   */
  update: function () {
    var self = this;
    self.model = horizon.networktopologycommon.topologyData;
    self.update_timer = setTimeout(function () {
      self.update();
    }, self.reload_duration);
  }
};
