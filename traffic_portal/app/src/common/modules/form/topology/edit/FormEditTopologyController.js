/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var FormEditTopologyController = function(topologies, cacheGroups, $scope, $controller, $uibModal, $anchorScroll, locationUtils, topologyService) {

	// extends the FormTopologyController to inherit common methods
	angular.extend(this, $controller('FormTopologyController', { topology: topologies[0], cacheGroups: cacheGroups, $scope: $scope }));

	var deleteTopology = function(topology) {
		topologyService.deleteTopology(topology.id)
			.then(function() {
				locationUtils.navigateToPath('/topologies');
			});
	};

	$scope.topologyName = angular.copy($scope.topology.name);

	$scope.settings = {
		isNew: false,
		saveLabel: 'Update'
	};

	$scope.save = function(topology) {
		topologyService.updateTopology(topology).
		then(function() {
			$scope.topologyName = angular.copy(topology.name);
			$anchorScroll(); // scrolls window to top
		});
	};

	$scope.confirmDelete = function(topology) {
		var params = {
			title: 'Delete Topology: ' + topology.name,
			key: topology.name
		};
		var modalInstance = $uibModal.open({
			templateUrl: 'common/modules/dialog/delete/dialog.delete.tpl.html',
			controller: 'DialogDeleteController',
			size: 'md',
			resolve: {
				params: function () {
					return params;
				}
			}
		});
		modalInstance.result.then(function() {
			deleteTopology(topology);
		}, function () {
			// do nothing
		});
	};

};

FormEditTopologyController.$inject = ['topologies', 'cacheGroups', '$scope', '$controller', '$uibModal', '$anchorScroll', 'locationUtils', 'topologyService'];
module.exports = FormEditTopologyController;