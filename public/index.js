// import d3;

let vpWidth = window.innerWidth * 1.1;
let vpHeight = window.innerHeight * 1.2;
const radius = window.innerHeight/2;

var colorin = "#00f"
var colorout = "#f00"
var colornone = "#ccc"


// const svg = d3.select('svg');
//
// można bez problemu ustawić ciemne tło
// svg.style('background-color', '#ddd')/[]

topic = 'school'

line = d3.lineRadial()
    .curve(d3.curveBundle.beta(0.55))
    .radius(d => d.y)
    .angle(d => d.x)

tree = d3.cluster()
    .size([2 * Math.PI, radius*.95])

leaves = readAnalysis(topic)
   .then(hierarchy)
   .then(d3.hierarchy)
   .then(links)
   .then(tree)
   .then(r => r.leaves())
   // .then(console.log)

leavesMapped = leaves
   .then(flatMap)
   // .then(console.log)

// appearances = root
//    .then(r => r.)

async function draw() {

   const svg = d3.select("svg")
      .attr("viewBox", [-vpWidth / 2,
                        -vpHeight / 2,
                         vpWidth,
                         vpHeight])

   const node = svg.append("g")
      .attr("font-family", "sans-serif")
      .selectAll("g")
      .data(await leaves)
      .join("g")
      .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
      .append("text")
      .attr("dy", "0.31em")  // center words on nodes
      .attr("font-size", d => `${5 + d.data.appearances}px`)
      .attr("x", d => d.x < Math.PI ? 6 : -6)
      .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
      .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
      .text(d => d.data.word.charAt(0).toUpperCase() + d.data.word.slice(1) )
      .each( function(d) {d.text = this} )
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
      d3.select(this).attr("font-weight", "bold");
      d3.selectAll(d.connections.map(d => d.path)).attr("stroke", colorout).raise();
      d3.selectAll(d.connections.map(d => d[1].text)).attr("fill", colorout).attr("font-weight", "bold")
   }

   function outed(d) {
      link.style("mix-blend-mode", "multiply");
      d3.select(this).attr("font-weight", null);
      d3.selectAll(d.connections.map(d => d.path)).attr("stroke", null);
      d3.selectAll(d.connections.map(d => d[1].text)).attr("fill", null).attr("font-weight", null);
   }

  return svg.node();
}



draw()
