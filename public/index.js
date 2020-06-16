// import d3;

let vpWidth = window.innerWidth * 1.1;
let vpHeight = window.innerHeight * 1.4;
const radius = window.innerHeight/2;

var colornone = "#ccc"
topic = 'visualization'

line = d3.lineRadial()
    .curve(d3.curveBundle.beta(0.55))
    .radius(d => d.y)
    .angle(d => d.x)

tree = d3.cluster()
    .size([2 * Math.PI, radius*.9])




async function draw() {
   leaves = readAnalysis(topic)
      .then(hierarchy)
      .then(d3.hierarchy)
      .then(d => d.sort((x1, x2) => d3.ascending(x1.data.word, x2.data.word)))
      .then(links)
      .then(tree)
      .then(r => r.leaves())
      // .then(console.log)

   leavesMapped = leaves
      .then(flatMap)
      // .then(console.log)

   maxAppearances = leaves
      .then(l => l.map(l => l.data.appearances))
      .then(arr => Math.max.apply(null, arr))
      // .then(console.log)

   maxConnections = leaves
      .then(l => l.map(l => l.data.connections.length))
      .then(arr => Math.max.apply(null, arr))
      // .then(console.log)

   const svg = d3.select("svg")
      .attr("viewBox", [-vpWidth / 2,
                        -vpHeight / 2,
                         vpWidth,
                         vpHeight])
   svg.selectAll("*").remove();

   const maxConn = await maxConnections;

   const node = svg.append("g")
      .attr("font-family", "sans-serif")
      .selectAll("g")
      .data(await leaves)
      .join("g")
      .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
      .append("text")
      .attr("dy", "0.31em")  // center words on nodes
      .each( function(d) { d.color = `rgb(
               ${ d.data.connections.length / maxConn * 204 },
               ${ 232 - (d.data.connections.length / maxConn * 232) },
               ${ 255 - (d.data.connections.length / maxConn * 135) })` })
      .attr("fill", d => d.color)
      .each( function(d) { d.fontSize = 5 + d.data.appearances * radius / 200})
      .attr("font-size", d => `${d.fontSize}px`)
      .attr("x", d => d.x < Math.PI ? 6 : -6)
      .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")  // shifting the text on the left side of the circle
      .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
      .text(d => d.data.word.charAt(0).toUpperCase() + d.data.word.slice(1) )
      .each( function(d) { d.text = this } )
      .on("mouseover", overed)
      .on("mouseout", outed)
      .call(text => text.append("title").text(d => `${d.data.word}
         ${d.connections.length} connections`));

   const link = svg.append("g")
      .attr("stroke", colornone)
      .attr("fill", "none")
      .selectAll("path")
      .data(await leavesMapped)
      .join("path")
      .style("mix-blend-mode", "multiply")
      .attr("d", ([i, o]) => line(i.path(o)))
      .each(function(d) { d.path = this; });

   function overed(d) {
      link.style("mix-blend-mode", null);
      d3.select(this)
         .attr("font-weight", "bold")
         .attr("font-size", d => `${d.fontSize + 5}px`);
      d3.selectAll(d.connections.map(d => d.path))
         .attr("stroke", d.color).raise()
         .attr("stroke-width", vpHeight/500);
      d3.selectAll(d.connections.map(d => d[1].text))
         .attr("font-weight", "bold")
         .attr("font-size", d => `${d.fontSize + 5}px`);
   }

   function outed(d) {
      link.style("mix-blend-mode", "multiply");
      d3.select(this)
         .attr("font-weight", null)
         .attr("font-size", d => `${d.fontSize}px`);
      d3.selectAll(d.connections.map(d => d.path))
         .attr("stroke", null)
         .attr("stroke-width", 1);
      d3.selectAll(d.connections.map(d => d[1].text))
         .attr("font-weight", null)
         .attr("font-size", d => `${d.fontSize}px`);
   }

  return svg.node();
}



draw()
