// graph.js
// Immediately-invoked async function for scope and async/await
(async function() {
  // Inject CSS for filter bar and legend div
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    #filters { position: fixed; top: 10px; left: 10px; background: rgba(255,255,255,0.95); padding: 8px 12px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-family: sans-serif; font-size: 13px; z-index: 1000; }
    #filters label { margin-right: 8px; }
    #filters input { padding: 2px 4px; border: 1px solid #ccc; border-radius: 4px; }
    #filters button { margin-left: 6px; padding: 4px 6px; border: none; border-radius: 4px; background: #4a90e2; color: white; cursor: pointer; }
    #filters button:hover { background: #357ab8; }
    #filters button:active { transform: scale(0.98); }
    #legendDiv { position: fixed; top: 10px; right: 10px; background: rgba(255,255,255,0.95); padding: 8px 12px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-family: sans-serif; font-size: 12px; z-index: 1000; }
  `;
  document.head.appendChild(styleEl);

  // Create filter controls container
  const filterDiv = document.createElement('div');
  filterDiv.id = 'filters';
  filterDiv.innerHTML = `
    <label>From <input type="date" id="fromDate"></label>
    <label>To <input type="date" id="toDate"></label>
    <button id="applyFilter">Apply</button>
    <button id="last3">Last 3 days</button>
    <button id="last7">Last 7 days</button>
  `;
  document.body.appendChild(filterDiv);

  // Create legend container
  const legendDiv = document.createElement('div');
  legendDiv.id = 'legendDiv';
  legendDiv.innerHTML = '';
  document.body.appendChild(legendDiv);

  // Grab control elements
  const fromInput = document.getElementById('fromDate');
  const toInput = document.getElementById('toDate');
  const applyBtn = document.getElementById('applyFilter');
  const last3Btn = document.getElementById('last3');
  const last7Btn = document.getElementById('last7');

  // Select SVG and setup dimensions
  const svg = d3.select('#graph');
  const width = window.innerWidth;
  const height = window.innerHeight;
  svg.attr('viewBox', [0, 0, width, height]);

  // Container group for zoom/pan
  const container = svg.append('g');
  svg.call(d3.zoom().on('zoom', e => container.attr('transform', e.transform)));

  // Tooltip
  const tooltip = d3.select('body').append('div')
    .attr('id', 'tooltip')
    .style('position', 'absolute')
    .style('pointer-events', 'none')
    .style('background', 'rgba(255,255,255,0.95)')
    .style('padding', '4px 8px')
    .style('border', '1px solid #999')
    .style('border-radius', '4px')
    .style('font-size', '12px')
    .style('opacity', 0);

  // Cache all history
  let fullHistory = [];

  // Load data
  chrome.storage.local.get(['history'], data => {
    fullHistory = (data.history || []).sort((a, b) => a.startTime - b.startTime);
    if (fullHistory.length) {
      const first = new Date(fullHistory[0].startTime).toISOString().slice(0, 10);
      const last = new Date().toISOString().slice(0, 10);
      fromInput.value = first;
      toInput.value = last;
    }
    drawGraph(fullHistory);
  });

  // Utility to get filtered history
  function getFiltered() {
    const startTS = fromInput.value ? new Date(fromInput.value).getTime() : 0;
    const endTS = toInput.value ? new Date(toInput.value + 'T23:59:59.999').getTime() : Date.now();
    const filtered = fullHistory.filter(r => r.startTime >= startTS && r.startTime <= endTS);
    return filtered;
  }

  // Hook up filter buttons
  applyBtn.onclick = () => drawGraph(getFiltered());
  last3Btn.onclick = () => {
    const now = Date.now();
    const from = new Date(now - 3 * 86400000).toISOString().slice(0, 10);
    fromInput.value = from;
    toInput.value = new Date(now).toISOString().slice(0, 10);
    drawGraph(getFiltered());
  };
  last7Btn.onclick = () => {
    const now = Date.now();
    const from = new Date(now - 7 * 86400000).toISOString().slice(0, 10);
    fromInput.value = from;
    toInput.value = new Date(now).toISOString().slice(0, 10);
    drawGraph(getFiltered());
  };

  // Main draw function
  function drawGraph(history) {
    // Clear previous elements
    container.selectAll('*').remove();

    // Frequency calculation
    const freq = new Map();
    history.forEach(r => freq.set(r.url, (freq.get(r.url) || 0) + 1));
    const counts = Array.from(freq.values());
    const minC = Math.min(...counts, 1);
    const maxC = Math.max(...counts, 1);

    // Color scale
    const colorScale = d3.scaleSequential(d3.interpolateYlGnBu).domain([minC, maxC]);

    // Build nodes & links
    const nodesMap = new Map();
    history.forEach((r, i) => {
      if (!nodesMap.has(r.url)) nodesMap.set(r.url, { id: r.url, title: r.title, order: i, count: freq.get(r.url) });
    });
    const nodes = Array.from(nodesMap.values());
    const links = history.slice(1).map((r, i) => ({ source: history[i].url, target: r.url }));

    // Simulation setup
    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-150))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Draw links
    container.append('g')
      .attr('stroke', '#aaa')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1.2);

    // Draw nodes
    container.append('g')
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 8)
      .attr('fill', d => colorScale(d.count))
      .call(d3.drag()
        .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }));

    // Tooltip interactions
    container.selectAll('circle')
      .on('mouseover', (e, d) => {
        tooltip.html(`<strong>#${d.order + 1}: ${d.title}</strong><br/><em>Visits: ${d.count}</em>`)
          .style('left', e.pageX + 5 + 'px')
          .style('top', e.pageY + 5 + 'px')
          .transition().duration(100).style('opacity', 1);
      })
      .on('mouseout', () => tooltip.transition().duration(100).style('opacity', 0));

    // Update legendDiv
    const gradStr = `linear-gradient(to right, ${colorScale(minC)}, ${colorScale(maxC)})`;
    legendDiv.innerHTML = `
      <div style="display:flex; align-items:center;">
        <span>${minC}</span>
        <div style="flex:1; height:8px; background:${gradStr}; margin:0 8px; border:1px solid #666;"></div>
        <span>${maxC}</span>
      </div>
      <div style="text-align:center; margin-top:4px;">Visit Frequency</div>
    `;

    // Simulation tick updates
    sim.on('tick', () => {
      container.selectAll('line')
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      container.selectAll('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    });
  }
})();
