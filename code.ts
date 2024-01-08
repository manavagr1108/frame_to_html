const nodesTree: any = {};
const nodesCode: any = {};
function rgbaToHex(rgba: any) {
  const clamp = (value: number) => Math.round(Math.min(255, Math.max(0, value)));
  const hex = (value: number) => {
    const hexValue = clamp(value).toString(16);
    return hexValue.length === 1 ? '0' + hexValue : hexValue;
  };

  return `#${hex(rgba.r * 255)}${hex(rgba.g * 255)}${hex(rgba.b * 255)}`;
}
function generateHTMLCode(id: string){
  if(!nodesTree[id]){
    return nodesCode[id];
  } else {
    if(nodesCode[id] === undefined || nodesCode[id] === '')return '';
    let parentCode = nodesCode[id].split('>');
    let childCode = '';
    nodesTree[id].forEach((id: string) => {
      const newCode = generateHTMLCode(id);
      if(newCode !== undefined && newCode !== '')childCode += newCode;
    })
    const mergeCode = parentCode[0] + '>' + childCode + parentCode[1] + '>';
    return mergeCode;
  }
}
function generateElementHTML(node: any){
  let color = null, borderColor = null;
  if(node.fills && node.fills.length !== 0){
    const fills = node.fills[0].color;
    color = rgbaToHex(fills);
  }
  if(node.strokes && node.strokes.length !== 0){
    const border = node.strokes[0].color;
    borderColor = rgbaToHex(border);
  }
  const position = { x: node.x, y: node.y };
  const htmlCSSCode = `
    <div id=${node.id} style=" position: absolute; left: ${position.x}px; top: ${position.y}px; ${color ? `background-color:${color};` : '' } ${borderColor ? `border: 1px solid ${borderColor};` : '' }">
    </div>
  `;
  return htmlCSSCode; 
}
function setNode(node: any){
  if(node.type === 'FRAME' || node.type === 'RECTANGLE' || node.type === 'ELLIPSE' || node.type === 'GROUP'){
    nodesCode[`${node.id}`] = generateElementHTML(node);
  } else {
    nodesCode[`${node.id}`] = '';
  }
}
function generateNodeTree(node: any) {
  setNode(node);
  if(!node.children) return;
  const children = node.children;
  nodesTree[`${node.id}`] = [];
  children.forEach((child: any) => {
    nodesTree[`${node.id}`].push(child.id);
    generateNodeTree(child);
  });
}

function runPlugin() {
  const selectedFrame = figma.currentPage.selection[0];
  if (selectedFrame && selectedFrame.type === "FRAME") {
    generateNodeTree(selectedFrame);
    console.log(generateHTMLCode(selectedFrame.id));
    console.log(nodesTree, nodesCode);
  } else {
    console.error("Please select a valid frame for the plugin.");
  }
}

runPlugin();
