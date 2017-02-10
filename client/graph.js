function displayVotingResultsGraph(results)
{
/*
 * Code heavily derived from that found at
 * http://bl.ocks.org/juan-cb/faf62e91e3c70a99a306
 */
	var data = results.data;

    var axisMargin = 20;
    var margin = 40;
    var valueMargin = 4;
    var width = 500;
    var height = 300;
    var barPadding = 2;
    var barHeight = height / data.length - barPadding / 2;
    var bar, svg, scale, xAxis, labelWidth = 0;

    max = d3.max(data, function(d) { return d.value; });

    svg = d3.select('#graph')
            .append("svg")
            .attr("width", width)
            .attr("height", height);

    bar = svg.selectAll("g")
            .data(data)
            .enter()
            .append("g");

    bar.attr("class", "bar")
            .attr("cx",0)
            .attr("transform", function(d, i) {
                return "translate(" + margin + "," + (i * 
                    (barHeight + barPadding) + barPadding) + ")";
            });

    bar.append("text")
            .attr("class", "label")
            .attr("y", barHeight / 2)
            .attr("dy", ".35em") //vertical align middle
            .text(function(d){
                return d.label;
            }).each(function() {
    		    labelWidth = Math.ceil(Math.max(labelWidth, 
					this.getBBox().width) + 3);
    });

    scale = d3.scale.linear()
            .domain([0, max])
            .range([0, width - margin * 2 - labelWidth]);

    xAxis = d3.svg.axis()
            .scale(scale)
            .tickSize(-height + 2 * margin + axisMargin)

    bar.append("rect")
            .attr("transform", "translate(" + labelWidth + ", 0)")
            .attr("height", barHeight)
            .attr("width", function(d) {
                return scale(d.value);
            });

    bar.append("text")
            .attr("class", "value")
            .attr("y", barHeight / 2)
            .attr("dx", -valueMargin + labelWidth) //margin right
            .attr("dy", ".35em") //vertical align middle
            .attr("text-anchor", "end")
            .text(function(d){
                return (d.value /* + "votes" */);
            })
            .attr("x", function(d) {
                var width = this.getBBox().width;
                return Math.max(width + valueMargin, scale(d.value));
            });
}
