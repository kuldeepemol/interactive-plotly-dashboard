function buildMetadata(sample) {

    var metadata_url = '/metadata/'+sample;

    // Use `d3.json` to fetch the metadata for a sample
    d3.json(metadata_url).then(function(data) {

        // Use d3 to select the panel with id of `#sample-metadata`
        var sampleMetadataObj = d3.select('#sample-metadata');

        // Use `.html("") to clear any existing metadata
        sampleMetadataObj.html('');

        // Use `Object.entries` to add each key and value pair to the panel
        // Hint: Inside the loop, you will need to use d3 to append new
        // tags for each key-value in the metadata.
        Object.entries(data).forEach(([key, value]) => {
            sampleMetadataObj.append("strong").html(key+': '+value+'<br/><br>');
        });

        // BONUS: Build the Gauge Chart
        buildGauge(data.WFREQ);
    });
}

function buildGauge(washFreq) {

    var level = washFreq;

    // Trig to calc meter point
    var degrees = 180 - level*20,
        radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
         pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var data = [
        {
            type: 'scatter',
            x: [0],
            y:[0],
            marker: {size: 28, color:'850000'},
            showlegend: false,
            name: 'Scrubs per week',
            text: level,
            hoverinfo: 'text+name'
        },
        {
            values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
            rotation: 90,
            text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
            textinfo: 'text',
            textposition:'inside',
            marker: {
                colors:[
                    'rgba(0,128,0,0.9)', 'rgba(0,128,0,0.8)', 'rgba(0,128,0,0.7)',
                    'rgba(0,128,0,0.6)', 'rgba(0,128,0,0.4)', 'rgba(0,128,0,0.4)',
                    'rgba(0,128,0,0.3)', 'rgba(0,128,0,0.2)', 'rgba(0,128,0,0.1)',
                    'rgba(0,128,0,0)'
                ]
            },
            labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
            hoverinfo: 'label',
            hole: .5,
            type: 'pie',
            showlegend: false
        }
    ];

    var layout = {
        shapes:[
            {
                type: 'path',
                path: path,
                fillcolor: '850000',
                line: {
                    color: '850000'
                }
            }
        ],
        title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
        xaxis: {zeroline:false, showticklabels:false,
             showgrid: false, range: [-1, 1]},
        yaxis: {zeroline:false, showticklabels:false,
             showgrid: false, range: [-1, 1]}
    };

    Plotly.newPlot('gauge', data, layout);

}

function buildCharts(sample) {

    // Use `d3.json` to fetch the sample data for the plots
    var sampledata_url = '/samples/'+sample;

    d3.json(sampledata_url).then(function(data) {

        // Build a Bubble Chart using the sample data
        var bubbleTrace1 = {
            x: data.otu_ids,
            y: data.sample_values,
            text: data.otu_labels,
            mode: 'markers',
            marker: {
                color: data.otu_ids,
                size: data.sample_values,
                sizeref: 1.3
            }
        };
        var bubbleData = [bubbleTrace1];
        var bubbleLayout = {
            xaxis: { title: 'OTU ID'}
        };

        Plotly.newPlot('bubble', bubbleData, bubbleLayout);

        // Create a newList object to store all the data from JSON
        var newList = [];
        for (let i = 0; i < data.sample_values.length; i++) {

            newList.push({'label': data.otu_labels[i],
                          'value': data.sample_values[i],
                          'ids': data.otu_ids[i]
                         });
        }

        // Sort the newList by values in descending order
        newList.sort(function(a, b) {
            return parseInt(b.value) - parseInt(a.value);
        });

        // Slice top 10 array
        newList = newList.slice(0,10);

        // Build a Pie Chart
        var pieTrace1 = {
            labels: newList.map(d => d.ids),
            values: newList.map(d => d.value),
            type: 'pie',
        };

        var pieData = [pieTrace1];

        Plotly.newPlot('pie', pieData);

    });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
