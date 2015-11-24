
/**
 * Return the intersection of a and b
 * @param {array} a
 * @param {array} b 
 * @returns {array} 
 */
var intersect = function(a, b) {
    var t;
    if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
    return a.filter(function (e) {
        if (b.indexOf(e) !== -1) return true;
    });
}


/**
 * Return the union of a and b
 * @param {type} a Description
 * @param {type} b Description
 */
var union = function(x, y) {
  var obj = {};
  for (var i = x.length-1; i >= 0; -- i)
     obj[x[i]] = x[i];
  for (var i = y.length-1; i >= 0; -- i)
     obj[y[i]] = y[i];
  var res = []
  for (var k in obj) {
    if (obj.hasOwnProperty(k))  // <-- optional
      res.push(obj[k]);
  }
  return res;
}


/**
 * Using the papa parse result this function generates the adjacencyList. 
 * The indexes are a node ID and its contents holds the connections. For example:
 * [1] = [2, 3, 4]
 * [2] = [1]
 * ...
 * @param {type} result papa parse result
 */
var generateAdjacencyList = function(result){
    
    var adjacencyList = {};
    var i;
    // iteration through each line 
    for (i = 0; i < result.data.length; i++) {

        // IF is undefined we do not have any array associated with this node, so we have to create one
        if (typeof adjacencyList[result.data[i][0]] === 'undefined') {
            adjacencyList[result.data[i][0]] = [result.data[i][1]];
        }
        // if we do have the array then we just push the new value
        else {
            adjacencyList[result.data[i][0]].push(result.data[i][1]);
        }
    }
    return adjacencyList;
}


/**
 * Generate some important statistics using a adjacencyList
 * nodeDegree
 * nodeDegree Average
 * predictionList using CN
 * predictionList using Jaccard
 * @param adjacencyList 
 */
var calculateStatistics = function(adjacencyList){
    
    // Array that contains the degree of each node in the graph
    var nodeDegree = {};
    var nodeDegreeAverage = 0;
    
    // We have the predition list using Common Neighborhood and Jaccard
    var predictionLinksListCN = {};
    var predictionLinksListJac = {};

    
    // calculating node degree for each node
    for (var key in adjacencyList) {
        
        // The node degree is the number of connectins that a node has
        nodeDegree[key] = adjacencyList[key].length;
        nodeDegreeAverage += nodeDegree[key];

        // mathematically CN is: |(r) intersection (s)|
        // and Jaccad is |(r) intersection (s)| / |(r) union (s)|
        
        // For each combination that creates a current non-existent link we have a CN and Jaccard value
        var r = adjacencyList[key];
        for (var _key in adjacencyList) {
            var s = adjacencyList[_key];
            // We do not need to compare the same array
            if (r !== s) {
                // Check if the nodes are not connected
                if($.inArray(_key, adjacencyList[key]) === -1){
                    
                    // we dont want any duplicates
                    if (typeof predictionLinksListCN[key + ',' + _key] === 'undefined' 
                           && typeof predictionLinksListCN[_key + ',' + key] === 'undefined'){
                    predictionLinksListCN[key + ',' + _key] = intersect(r, s).length;
                    predictionLinksListJac[key + ',' + _key] = intersect(r, s).length / union(r,s).length;

                    }
                }  
            }
        }
    }
    
    nodeDegreeAverage /= Object.keys(adjacencyList).length;
    
    // Returns an object that contains nodeDegree, the average and two predicitionLists
    return {
        nodeDegree: nodeDegree,
        nodeDegreeAverage: nodeDegreeAverage,
        predictionLinksListCN: predictionLinksListCN,
        predictionLinksListJac: predictionLinksListJac
    };
}


/**
 * Description
 * @param {type} adjacencyList Description
 * @param {type} nodeDegree Description
 */
var preProcessingRemoveLinks = function(adjacencyList, nodeDegree){
  for(var key in adjacencyList){
      console.log(adjacencyList[key]);
  }  
  //TODO
};


/**
 * Function that is called after the file is parsed
 * @param {type} result Description
 * @returns {type} Description
 */
var splitData = function (result) {
    
    // create the adjacencyList
    var adjacencyList = generateAdjacencyList(result);
    
    console.log(adjacencyList);
    
    // Gerenate some statistics
    var statistics = calculateStatistics(adjacencyList);   
    
    console.log("Number of Nodes: " + Object.keys(adjacencyList).length);
    console.log(statistics.nodeDegree);
    console.log("Node Degree Average: " + statistics.nodeDegreeAverage);

    console.log("Sorting prediction List...");

    // Sort the CN prediction list to generate a ranking
    var keysSortedCN = Object.keys(statistics.predictionLinksListCN).sort(function (a, b) {
        return statistics.predictionLinksListCN[b] - statistics.predictionLinksListCN[a]
    });
    
    // Sort the Jaccard prediction list to generate a ranking
    var keysSortedJac = Object.keys(statistics.predictionLinksListJac).sort(function (a, b) {
        return statistics.predictionLinksListJac[b] - statistics.predictionLinksListJac[a]
    });
    
    // This part is optinal, it reduces performance because copies a huge object
    var prediciontLinksListJacSorted = {};
    keysSortedJac.forEach(function (element) {
        prediciontLinksListJacSorted[element] = statistics.predictionLinksListJac[element];
    });
    var prediciontLinksListCNSorted = {};
    keysSortedCN.forEach(function (element) {
        prediciontLinksListCNSorted[element] = statistics.predictionLinksListCN[element];
    });
    
    console.log(prediciontLinksListCNSorted);
    console.log(prediciontLinksListJacSorted);
    
    // We want only the first 10% values of our generated rankings
    var partialRankSize = Math.ceil((Object.keys(prediciontLinksListCNSorted).length * 0.1));
    var current = 0;

    $('.statistics').append('Showing only the first ' + partialRankSize + ' entries <br>');    
    for(var key in prediciontLinksListCNSorted){
        
        if(current < partialRankSize){
            $('.statistics').append('[' + key + ']' + ' = ' + prediciontLinksListCNSorted[key] + '<br>');
            current++;
        }
    }
    
    current = 0;
    for(var key in prediciontLinksListJacSorted){
        
        if(current < partialRankSize){
            $('.statisticsJac').append('[' + key + ']' + ' = ' + prediciontLinksListJacSorted[key] + '<br>');
            current++;
        }
    }
    
    // Barchar plot
    generateBarchart(statistics);

}


/**
 * Description
 * @param {type} statistics Description
 */
var generateBarchart = function (statistics) {
    // var d1 = [[0, 3], [1, 3], [2, 5], [3, 7], [4, 8], [5, 10], [6, 11], [7, 9], [8, 5], [9, 13]];
    var data = {};

    for (var key in statistics.nodeDegree) {
        data[statistics.nodeDegree[key]] = 0;
    }

    for (var key in statistics.nodeDegree) {
        data[statistics.nodeDegree[key]] = data[statistics.nodeDegree[key]] + 1;
    }

    var dataToPlot = [];
    for (var key in data) {
        dataToPlot.push([key, data[key]]);
    }

    $(document).ready(function () {
        $.plot($("#placeholder"), [
            {
                data: dataToPlot,
                bars: {
                    show: true
                }
            }
        ]);
    });

    //$('.statistics').append('Node Average: ' + statistics.nodeDegreeAverage);

}


/**
 * Description
 */
var parse = function () {
    var selectedFile = $('#uploadFile').get(0);
    $('.loading-message').html('loading');

    Papa.parse(selectedFile.files[0], {
        delimiter: ' ',
        complete: function (results) {
            splitData(results);
            $('.loading-message').html('finished');

        }
    });


};


/**
 * Description
 */
var generateGraph = function () {
    var nodes = [];
    var edges = [];

    for (var key in adjacencyList) {
        nodes.push({
            data: {
                id: key
            }
        });

        var currentArray = adjacencyList[key];

        currentArray.forEach(function (element) {
            edges.push({
                data: {
                    id: key + element,
                    source: key,
                    target: element
                }
            });
        });
    }

    console.log(nodes);
    console.log(edges);


    var cy = cytoscape({
        container: document.getElementById('cy'),

        boxSelectionEnabled: false,
        autounselectify: true,

        style: cytoscape.stylesheet()
            .selector('node')
            .css({
                'content': 'data(id)'
            })
            .selector('edge')
            .css({
                'target-arrow-shape': 'triangle',
                'width': 4,
                'line-color': '#ddd',
                'target-arrow-color': '#ddd'
            }),

        elements: {
            nodes: nodes,

            edges: edges
        },

        layout: {
            name: 'concentric',
            directed: true,
            roots: '#a',
            padding: 10
        }
    });
};