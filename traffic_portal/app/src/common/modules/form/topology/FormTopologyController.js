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

var FormTopologyController = function(topology, cacheGroups, $anchorScroll, $scope, $location, $uibModal, formUtils, locationUtils, topologyUtils, messageModel) {

	let cacheGroupNamesInTopology = [];

	let hydrateTopology = function() {
		// add some needed fields to each cache group (aka node) of a topology
		topology.nodes.forEach(function(node) {
			let cacheGroup = cacheGroups.find( function(cg) { return cg.name === node.cachegroup} );
			Object.assign(node, { id: cacheGroup.id, type: cacheGroup.typeName });
		});
	};

	let removeSecParentReferences = function(topologyTree, secParentName) {
		// when a cache group is removed, any references to the cache group as a secParent need to be removed
		topologyTree.forEach(function(node) {
			if (node.secParent && node.secParent === secParentName) {
				node.secParent = '';
			}
			if (node.children && node.children.length > 0) {
				removeSecParentReferences(node.children, secParentName);
			}
		});
	};

	// build a list of cache group names currently in the topology
	let buildCacheGroupNamesInTopology = function(topologyTree, fromScratch) {
		if (fromScratch) cacheGroupNamesInTopology = [];
		topologyTree.forEach(function(node) {
			if (node.cachegroup) {
				cacheGroupNamesInTopology.push(node.cachegroup);
			}
			if (node.children && node.children.length > 0) {
				buildCacheGroupNamesInTopology(node.children, false);
			}
		});
	};

	$scope.topology = topology;

	$scope.topologyTree = [];

	$scope.topologyTreeOptions = {
		beforeDrop: function(evt) {
			let node = evt.source.nodeScope.$modelValue,
				parent = evt.dest.nodesScope.$parent.$modelValue;

			if (!parent || !node) {
				return false; // no dropping outside the toplogy tree and you need a node to drop
			}

			// ORG_LOC cannot have a parent
			if (node.type === 'ORG_LOC' && parent.cachegroup) {
				$anchorScroll(); // scrolls window to top
				messageModel.setMessages([ { level: 'error', text: 'Cache groups of ORG_LOC type must not have a parent.' } ], false);
				return false;
			}

			// EDGE_LOC can only have EDGE_LOC children
			if (parent.type === 'EDGE_LOC' && node.type !== 'EDGE_LOC') {
				$anchorScroll(); // scrolls window to top
				messageModel.setMessages([ { level: 'error', text: 'EDGE_LOC cache groups can only have EDGE_LOC children.' } ], false);
				return false;
			}

			// update the parent and secParent fields of the node on successful drop
			if (parent.cachegroup) {
				node.parent = parent.cachegroup; // change the node parent based on where the node is dropped
				if (node.parent === node.secParent) {
					// node parent and secParent cannot be the same
					node.secParent = "";
				}
			} else {
				// the node was dropped at the root of the topology. no parents.
				node.parent = "";
				node.secParent = "";
			}
			// marks the form as dirty thus enabling the save btn
			$scope.topologyForm.dirty.$setDirty();
			return true;
		}
	};

	$scope.navigateToPath = locationUtils.navigateToPath;

	$scope.hasError = formUtils.hasError;

	$scope.hasPropertyError = formUtils.hasPropertyError;

	$scope.viewCacheGroups = function() {
		$location.path('/topologies/cache-groups');
	};

	$scope.viewDeliveryServices = function() {
		$location.path('/topologies/delivery-services');
	};

	$scope.nodeLabel = function(node) {
		return node.cachegroup || 'TOPOLOGY';
	};

	$scope.editSecParent = function(node) {

		if (!node.parent) return; // if a node has no parent, it can't have a second parent

		buildCacheGroupNamesInTopology($scope.topologyTree, true);

		/*  Cache groups that can act as a second parent include:
			1. cache groups that are not the current cache group (you can't parent/sec parent yourself)
			2. cache groups that are not currently acting as the primary parent (primary parent != sec parent)
			3. cache groups that exist currently in the topology only
			4a. any cache group types (ORG_LOC, MID_LOC, EDGE_LOC) if child cache group is EDGE_LOC
			4b. only MID_LOC or ORG_LOC cache group types if child cache group is not EDGE_LOC
		 */
		let eligibleSecParentCandidates = cacheGroups.filter(function(cg) {
			return (node.cachegroup && node.cachegroup !== cg.name) &&
				(node.parent && node.parent !== cg.name) &&
				cacheGroupNamesInTopology.includes(cg.name) &&
				((node.type === 'EDGE_LOC') || (cg.typeName === 'MID_LOC' || cg.typeName === 'ORG_LOC'));
		});

		let params = {
			title: 'Select a secondary parent',
			message: 'Please select a secondary parent that is part of the ' + topology.name + ' topology',
			key: 'name',
			required: false,
			selectedItemKeyValue: node.secParent,
			labelFunction: function(item) { return item['name'] + ' (' + item['typeName'] + ')' }
		};
		let modalInstance = $uibModal.open({
			templateUrl: 'common/modules/dialog/select/dialog.select.tpl.html',
			controller: 'DialogSelectController',
			size: 'md',
			resolve: {
				params: function () {
					return params;
				},
				collection: function() {
					return eligibleSecParentCandidates;
				}
			}
		});
		modalInstance.result.then(function(selectedSecParent) {
			if (selectedSecParent) {
				node.secParent = selectedSecParent.name;
			} else {
				node.secParent = '';
			}
			// marks the form as dirty thus enabling the save btn
			$scope.topologyForm.dirty.$setDirty();
		});
	};

	$scope.deleteCacheGroup = function(node, scope) {
		if (node.cachegroup) {
			removeSecParentReferences($scope.topologyTree, node.cachegroup);
			scope.remove();
			// marks the form as dirty thus enabling the save btn
			$scope.topologyForm.dirty.$setDirty();
		}
	};

	$scope.toggle = function(scope) {
		scope.toggle();
	};

	$scope.nodeError = function(node) {
		// only EDGE_LOCs can serve as a leaf node on the topology
		if (node.type !== 'EDGE_LOC' && node.children.length === 0) {
			return node.type + ' requires 1+ child cache group';
		}
		return '';
	};

	$scope.nodeWarning = function(node) {
		// only EDGE_LOCs with child EDGE_LOCs require special configuration
		if (node.type === 'EDGE_LOC' && node.children.length > 0) {
			return 'EDGE_LOC with EDGE_LOC children requires special config';
		}
		return '';
	};

	$scope.isOrigin = function(node) {
		return node.type === 'ROOT' || node.type === 'ORG_LOC';
	};

	$scope.isMid = function(node) {
		return node.type === 'MID_LOC';
	};

	$scope.hasChildren = function(node) {
		return node.children.length > 0;
	};

	$scope.addCacheGroups = function(parent, scope) {

		// cache groups already in the topology cannot be selected again for addition
		buildCacheGroupNamesInTopology($scope.topologyTree, true);

		let modalInstance = $uibModal.open({
			templateUrl: 'common/modules/table/topologyCacheGroups/table.selectTopologyCacheGroups.tpl.html',
			controller: 'TableSelectTopologyCacheGroupsController',
			size: 'lg',
			resolve: {
				parent: function() {
					return parent;
				},
				topology: function() {
					return topology;
				},
				cacheGroups: function(cacheGroupService) {
					return cacheGroupService.getCacheGroups();
				},
				usedCacheGroupNames: function() {
					return cacheGroupNamesInTopology;
				}
			}
		});
		modalInstance.result.then(function(result) {
			let nodeData = scope.$modelValue,
				cacheGroupNodes = result.selectedCacheGroups.map(function(cg) {
					return {
						id: cg.id,
						cachegroup: cg.name,
						type: cg.typeName,
						parent: (result.parent) ? result.parent : '',
						secParent: result.secParent,
						children: []
					}
				});
			cacheGroupNodes.forEach(function(node) {
				nodeData.children.unshift(node);
			});
			// marks the form as dirty thus enabling the save btn
			$scope.topologyForm.dirty.$setDirty();
		});
	};

	$scope.viewCacheGroupServers = function(node) {
		$uibModal.open({
			templateUrl: 'common/modules/table/topologyCacheGroupServers/table.topologyCacheGroupServers.tpl.html',
			controller: 'TableTopologyCacheGroupServersController',
			size: 'lg',
			resolve: {
				cacheGroupName: function() {
					return node.cachegroup;
				},
				cacheGroupServers: function(serverService) {
					return serverService.getServers({ cachegroup: node.id });
				}
			}
		});
	};

	let init = function() {
		hydrateTopology();
		$scope.topologyTree = topologyUtils.getTopologyTree($scope.topology);
	};
	init();
};

FormTopologyController.$inject = ['topology', 'cacheGroups', '$anchorScroll', '$scope', '$location', '$uibModal', 'formUtils', 'locationUtils', 'topologyUtils', 'messageModel'];
module.exports = FormTopologyController;
