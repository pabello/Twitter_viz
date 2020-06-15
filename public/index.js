const width = 800;
const squareSize = 500;
const radius = width/2;

var colorin = "#00f"
var colorout = "#f00"
var colornone = "#ccc"


// const svg = d3.select('svg');
//
// można bez problemu ustawić ciemne tło
// svg.style('background-color', 'black')/[]

topic = 'school'

line = d3.lineRadial()
    .curve(d3.curveBundle.beta(0.55))
    .radius(d => d.y)
    .angle(d => d.x)

tree = d3.cluster()
    .size([2 * Math.PI, radius - 100])

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

async function draw() {

   // const root = tree(links(d3.hierarchy(data)
   //    .sort((a, b) => d3.ascending(a.height, b.height) || d3.ascending(a.data.word, b.data.word))));

   const svg = d3.select("svg")
      .attr("viewBox", [-width / 2, -width / 2, width, width])


   const node = svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", '14px')
      .selectAll("g")
      .data(await leaves)
      .join("g")
      .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
      .append("text")
      .attr("dy", "0.31em")
      .attr("x", d => d.x < Math.PI ? 6 : -6)
      .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
      .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
      .text(d => d.data.word.charAt(0).toUpperCase() + d.data.word.slice(1) )
      .each( (d) => d.text = this )
      .on("mouseover", overed)
      .on("mouseout", outed)
      .call(text => text.append("title").text(d => `${id(d)}
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
      d3.selectAll(d.connections.map(([, d]) => d.text)).attr("fill", colorout).attr("font-weight", "bold");
   }

   function outed(d) {
      link.style("mix-blend-mode", "multiply");
      d3.select(this).attr("font-weight", null);
      d3.selectAll(d.connections.map(d => d.path)).attr("stroke", null);
      d3.selectAll(d.connections.map(([, d]) => d.text)).attr("fill", null).attr("font-weight", null);
   }

  return svg.node();
}



draw()
