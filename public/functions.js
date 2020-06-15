function hierarchy(data, delimiter = ".") {
  let root;
  const map = new Map;
  data.forEach(function find(data) {
    const {word} = data;
    if (map.has(word)) return map.get(word);
    const i = word.lastIndexOf(delimiter);
    map.set(word, data);
    if (i >= 0) {
      find({word: word.substring(0, i), children: []}).children.push(data);
      data.word = word.substring(i + 1);
    } else {
      root = data;
    }
    return data;
  });
  return root;
}

function links(root) {
   const map = new Map(root.leaves().map(d => [id(d), d]));
   for (const d of root.leaves()) d.connections = d.data.connections.map(i => [d, map.get(i)]);
   return root;
}

function id(node) {
  return `${node.parent ? id(node.parent) + "." : ""}${node.data.word}`;
}

function flatMap(leaves) {
   return leaves.map(d => d.connections).flat();
}

async function readAnalysis(topic) {
   try {
      let buffer = await fetch('/analyses/' + topic + '.json');
      return buffer.json();
  } catch (e) {
     console.log(e)
  }
}
