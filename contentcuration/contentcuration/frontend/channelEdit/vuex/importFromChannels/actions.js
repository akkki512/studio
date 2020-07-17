import client from 'shared/client';
import { Channel } from 'shared/data/resources';

// Function that calls the get_nodes_by_ids_complete endpoint
export function getCompleteContentNode(context, nodeId) {
  return client.get(`/api/get_nodes_by_ids_complete/${nodeId}`).then(response => {
    return response.data[0];
  });
}

// Function that calls the duplicate_nodes endpoint to add new nodes to the channel/topic
export function duplicateNodesToTarget(context, { nodeIds, targetNodeId }) {
  // get targetNodeId metadata.max_sort_order
  return getCompleteContentNode(context, targetNodeId).then(targetNode => {
    const maxSortOrder = targetNode.metadata.max_sort_order || 0;
    return client
      .post(window.Urls.duplicate_nodes(), {
        node_ids: nodeIds,
        sort_order: maxSortOrder + 1,
        target_parent: targetNodeId,
        channel_id: context.rootState.currentChannel.currentChannelId,
      })
      .then(response => {
        context.dispatch('task/startTask', { task: response.data }, { root: true });
        return response.data;
      });
  });
}

export function fetchResourceSearchResults(context, params) {
  delete params['last'];
  params.page_size = params.page_size || 50;
  return client.get(window.Urls.search_list(), { params }).then(response => {
    context.commit('contentNode/ADD_CONTENTNODES', response.data.results, { root: true });
    return response.data;
  });
}

export function loadChannels(context, params) {
  // Used for search channel filter dropdown
  params.page_size = 25;
  return Channel.requestCollection({ deleted: false, ...params }).then(channelPage => {
    return channelPage;
  });
}
