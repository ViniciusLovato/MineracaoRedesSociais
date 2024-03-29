
function productRange(a,b) {
  var product=a,i=a;
 
  while (i++<b) {
    product*=i;
  }
  return product;
}
 
function combinations(n,k) {
  if (n==k) {
    return 1;
  } else {
    k=Math.max(k,n-k);
    return productRange(k+1,n)/productRange(1,n-k);
  }
}

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

var factorial = function(num)
{
    // If the number is less than 0, reject it.
    if (num < 0) {
        return -1;
    }
    // If the number is 0, its factorial is 1.
    else if (num == 0) {
        return 1;
    }
    var tmp = num;
    while (num-- > 2) {
        tmp *= num;
    }
    return tmp;
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

var localClusteringCoeficient = function(adjacencyList, node){
    // get the total number of connection possibilities

    var listSize = adjacencyList[node].length;
    var localCoeficient = 0;
    
    if(listSize > 1){
        var possibilities = combinations(listSize, 2); //factorial(listSize) / (factorial(2) * factorial(listSize-2));
        var currentConnected = 0;
        
        for(var i = 0; i < adjacencyList[node].length; i++){
            // for some reason the first element is undefined when the file is parsed
            //if(typeof adjacencyList[adjacencyList[node][i]] !== 'undefined')
                currentConnected = parseInt(currentConnected) + parseInt(intersect(adjacencyList[node], adjacencyList[adjacencyList[node][i]]).length);
        }
        currentConnected = currentConnected/2;
        localCoeficient = currentConnected / possibilities;
    }
    else localCoeficient = 0;

    
    return localCoeficient;
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
    var globalCoeficientValue = 0;
    // var numberOfConnections = 0;
    
    // We have the predition list using Common Neighborhood and Jaccard
    var predictionLinksListCN = {};
    var predictionLinksListJac = {};
    var localCoeficientList = {};
    var removedLinksList = [];
    
    removedLinksList = removeLinks(adjacencyList);

    
    // calculating node degree for each node
    for (var key in adjacencyList) {
        localCoeficientList[key] = localClusteringCoeficient(adjacencyList, key);
        globalCoeficientValue = globalCoeficientValue  + localCoeficientList[key];
        
        // numberOfConnections = numberOfConnections + adjacencyList[key].length;

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
    
    var adjacencyListLength = Object.keys(adjacencyList).length;
    
    nodeDegreeAverage /= adjacencyListLength;
    globalCoeficientValue /= adjacencyListLength;
    // numberOfConnections /= 2;
        
    // Returns an object that contains nodeDegree, the average and two predicitionLists
    return {
        nodeDegree: nodeDegree,
        nodeDegreeAverage: nodeDegreeAverage,
        localCoeficientList: localCoeficientList,
        globalCoeficientValue: globalCoeficientValue,
        removedLinksList: removedLinksList,
        // numberOfConnections: numberOfConnections,
        predictionLinksListCN: predictionLinksListCN,
        predictionLinksListJac: predictionLinksListJac
    };
}


var randomProperty = function (obj) {
    var keys = Object.keys(obj)
    return keys[ keys.length * Math.random() << 0];
};


/**
 * Description
 * @param {type} adjacencyList Description
 * @param {type} nodeDegree Description
 */
var removeLinks = function(adjacencyList){
    
    var removed = 0;
    var numberOfConnections = 0;   
    var removedLinksList = [];
    
    for(var key in adjacencyList){
      numberOfConnections = numberOfConnections + adjacencyList[key].length;
    }  
    numberOfConnections /= 2;
    var numberOfLinksToRemove = Math.ceil(numberOfConnections * 0.1);
    
    for(removed = 0; removed < numberOfLinksToRemove; removed++){
        // get random node in the graph
        var randomNode = randomProperty(adjacencyList);
        var randomNode2 = adjacencyList[randomNode][Math.floor(Math.random() * adjacencyList[randomNode].length)];
        
        // get random connection
        
        // removing connection
        var index_1 = adjacencyList[randomNode].indexOf(randomNode2);
        if (index_1 > -1) {
            adjacencyList[randomNode].splice(index_1, 1);
        }
        
        if(typeof randomNode2 !== 'undefined'){
            var index_2 = adjacencyList[randomNode2].indexOf(randomNode);
            if (index_2 > -1) {
                adjacencyList[randomNode2].splice(index_2, 1);
                removedLinksList.push('[' + randomNode + ',' + randomNode2 + ']')
                // console.log('Connection to be removed: ' +  randomNode + ',' + randomNode2);
            }
        }
        else {
            delete adjacencyList[randomNode]
            // console.log('Removed the empty to be removed: ' +  randomNode + ',' + randomNode2);
        }

    }
  return removedLinksList;
};


/**
 * Function that is called after the file is parsed
 * @param {type} result Description
 * @returns {type} Description
 */
var splitData = function (result) {
    
    // create the adjacencyList
    var adjacencyList = generateAdjacencyList(result);
    
    console.log('Adjacency List');
    
    delete adjacencyList[''];
    console.log(adjacencyList);
    
    // Gerenate some statistics
    var statistics = calculateStatistics(adjacencyList);   
    
    generateViewStatistics(statistics);

}

var generateViewStatistics = function(statistics){
    
    console.log("Number of Nodes: " + Object.keys(statistics.nodeDegree).length);
    // console.log("Number of Connections: " + statistics.numberOfConnections);
    
    console.log('Node Degree List')
    console.log(statistics.nodeDegree);
    
    console.log("Node Degree Average: " + statistics.nodeDegreeAverage);
    
    console.log("Local coeficient List");
    console.log(statistics.localCoeficientList);

    console.log("Global coeficient Value: " + statistics.globalCoeficientValue);

    
    console.log("Sorting prediction List...");

    // Sort the CN prediction list to generate a ranking
    var keysSortedCN = Object.keys(statistics.predictionLinksListCN).sort(function (a, b) {
        return statistics.predictionLinksListCN[b] - statistics.predictionLinksListCN[a]
    });
    
    console.log('CN sorted');
    
    // Sort the Jaccard prediction list to generate a ranking
    var keysSortedJac = Object.keys(statistics.predictionLinksListJac).sort(function (a, b) {
        return statistics.predictionLinksListJac[b] - statistics.predictionLinksListJac[a]
    });
    
    console.log('Jac sorted');

    
    // This part is optinal, it reduces performance because copies a huge object
    var prediciontLinksListJacSorted = {};
    keysSortedJac.forEach(function (element) {
        prediciontLinksListJacSorted[element] = statistics.predictionLinksListJac[element];
    });
    var prediciontLinksListCNSorted = {};
    keysSortedCN.forEach(function (element) {
        prediciontLinksListCNSorted[element] = statistics.predictionLinksListCN[element];
    });
    
    console.log('finished optional part');
    
    // We want only the first 10% values of our generated rankings
    var partialRankSize = Math.ceil((Object.keys(prediciontLinksListCNSorted).length * 0.1));
    var current = 0;

    $('.statistics').append('Showing only the first ' + partialRankSize + ' entries <br>');    
    for(var key in prediciontLinksListCNSorted){
        
        if(current < partialRankSize){
            $('.statistics').append((parseInt(current)+1) + '. [' + key + ']' + ' = ' + prediciontLinksListCNSorted[key] + '<br>');
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
    
    statistics.removedLinksList.forEach(function(element){
        $('.removedLinks').append(element + '<br>');
    });
    
    // Barchar plot
    console.log('plotting barchar');
    generateBarchart(statistics);
    console.log('done');
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
                },
            }
        ]);
    });
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
