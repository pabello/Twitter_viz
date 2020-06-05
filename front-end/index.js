const width = 500;
const height = 500;

const svg = d3.select('svg');

svg.style('background-color', 'black')
   .attr('width', width)
   .attr('height', height)

const center = svg.append('circle')
   .attr('cx', width/2)
   .attr('cy', height/2)
   .attr('r', 100)
   .attr('fill', 'red')

const root = d3.tree(d3.bilink(d3.hierarchy()));
