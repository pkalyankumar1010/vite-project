import { useState, useMemo, useRef, useEffect } from "react"
import { Card, Badge, Button } from "react-bootstrap"
import "./LefVisualizer.css"

// Define types for better type safety
interface Layer {
  layer: string
  rects: number[][]
}

interface ViaStack {
  name: string
  layers: Layer[]
}

// Default empty data structure
const defaultLefData: ViaStack[] = []

// Generate colors dynamically
const generateColors = (count: number, isVia = false) => {
  // Vibrant, easily distinguishable colors (ColorBrewer + some tweaks)
  const vibrantPalette = [
    { fill: "#e6194b", stroke: "#a8002c" }, // Vivid Red
    { fill: "#3cb44b", stroke: "#006400" }, // Vivid Green
    { fill: "#ffe119", stroke: "#bfa800" }, // Vivid Yellow
    { fill: "#4363d8", stroke: "#1a237e" }, // Vivid Blue
    { fill: "#f58231", stroke: "#b35400" }, // Vivid Orange
    { fill: "#911eb4", stroke: "#4a0072" }, // Vivid Purple
    { fill: "#46f0f0", stroke: "#008b8b" }, // Cyan
    { fill: "#f032e6", stroke: "#a6007e" }, // Magenta
    { fill: "#bcf60c", stroke: "#5a7d00" }, // Lime
    { fill: "#fabebe", stroke: "#b76e79" }, // Pink
    { fill: "#008080", stroke: "#004d4d" }, // Teal
    { fill: "#e6beff", stroke: "#7e57c2" }, // Lavender
    { fill: "#9a6324", stroke: "#4e2e0e" }, // Brown
    { fill: "#fffac8", stroke: "#bdb76b" }, // Cream
    { fill: "#800000", stroke: "#400000" }, // Maroon
    { fill: "#aaffc3", stroke: "#008b5a" }, // Mint
    { fill: "#808000", stroke: "#404000" }, // Olive
    { fill: "#ffd8b1", stroke: "#b77d4a" }, // Apricot
    { fill: "#000075", stroke: "#000040" }, // Navy
    { fill: "#808080", stroke: "#404040" }, // Grey
  ];
  if (isVia) {
    // Use a subset of vibrant colors for vias, but with a dark stroke for contrast
    return Array(count)
      .fill(null)
      .map((_, i) => ({
        fill: vibrantPalette[(i * 2 + 1) % vibrantPalette.length].fill,
        stroke: "#222"
      }))
  }
  // Metals: use the full vibrant palette
  return Array(count)
    .fill(null)
    .map((_, i) => vibrantPalette[i % vibrantPalette.length])
}

// Define types for better type safety
interface Layer {
  layer: string
  rects: number[][]
}

interface ViaStack {
  name: string
  layers: Layer[]
}

// Generate dynamic layer styles
const generateLayerStyles = (data: ViaStack[]) => {
  const allLayers = new Set<string>()

  // Collect all unique layer names
  data.forEach((stack) => {
    stack.layers.forEach((layer) => {
      allLayers.add(layer.layer)
    })
  })

  const layerArray = Array.from(allLayers).sort()
  // Just use METAL and VIA layers for styles
  const metals = layerArray.filter((layer) => layer.toLowerCase().includes("met"))
  const vias = layerArray.filter((layer) => layer.toLowerCase().includes("via"))
  console.log("Metals:", metals)

  const metalColors = generateColors(metals.length, false)
  const viaColors = generateColors(vias.length, true)

  const styles: Record<string, { fill: string; stroke: string; pattern: string }> = {}

  // Assign styles to metals: even index -> forwardslash, odd index -> backslash
  metals.forEach((metal, index) => {
    styles[metal] = {
      ...metalColors[index],
      pattern: index % 2 === 0 ? "forwardslash" : "backslash",
    }
  })

  // Assign styles to vias
  vias.forEach((via, index) => {
    styles[via] = {
      ...viaColors[index],
      pattern: "solid",
    }
  })

  return styles
}

const PatternDefs = ({ layerStyles, selectedLayer }: { layerStyles: Record<string, { fill: string; stroke: string; pattern: string }>, selectedLayer?: string }) => {
  const metals = Object.keys(layerStyles).filter((layer) => layer.toLowerCase().includes("met"))
  const vias = Object.keys(layerStyles).filter((layer) => layer.toLowerCase().includes("via"))

  return (
    <defs>
      {/* Generate patterns for each metal layer */}
      {metals.map((metal) => {
        const style = layerStyles[metal]
        const patternId = `pattern-${metal.toLowerCase()}`
        const isSelected = selectedLayer && selectedLayer.startsWith(metal)
        const boldStroke = isSelected ? 2 : 0.5
        const boldOpacity = isSelected ? 1 : 0.7
        switch (style.pattern) {
          case "forwardslash":
            return (
              <pattern key={patternId} id={patternId} patternUnits="userSpaceOnUse" width="20" height="20">
                <rect width="20" height="20" fill="white" opacity="0.3" />
                <path d="M0,20 L20,0" stroke={style.stroke} strokeWidth={boldStroke} opacity={boldOpacity} />
                <path d="M-10,20 L10,0" stroke={style.stroke} strokeWidth={boldStroke} opacity={boldOpacity} />
                <path d="M10,20 L30,0" stroke={style.stroke} strokeWidth={boldStroke} opacity={boldOpacity} />
              </pattern>
            )
          case "backslash":
            return (
              <pattern key={patternId} id={patternId} patternUnits="userSpaceOnUse" width="20" height="20">
                <rect width="20" height="20" fill="white" opacity="0.3" />
                <path d="M0,0 L20,20" stroke={style.stroke} strokeWidth={boldStroke} opacity={boldOpacity} />
                <path d="M-10,0 L10,20" stroke={style.stroke} strokeWidth={boldStroke} opacity={boldOpacity} />
                <path d="M10,0 L30,20" stroke={style.stroke} strokeWidth={boldStroke} opacity={boldOpacity} />
              </pattern>
            )
          default:
            return (
              <pattern key={patternId} id={patternId} patternUnits="userSpaceOnUse" width="4" height="4">
                <rect width="4" height="4" fill={style.fill} opacity="0.8" />
              </pattern>
            )
        }
      })}

      {/* Generate via patterns */}
      {vias.map((via, index) => {
        const correspondingMetal = metals[index % metals.length]
        const metalStyle = layerStyles[correspondingMetal] || layerStyles[metals[0]]
        const patternId = `viaGrid-${via.toLowerCase()}`

        return (
          <pattern key={patternId} id={patternId} patternUnits="userSpaceOnUse" width="16" height="16">
            <rect width="16" height="16" fill={metalStyle.fill} opacity="0.6" />
            {/* Big cross mark (X) connecting corners */}
            <line x1="0" y1="0" x2="16" y2="16" stroke={metalStyle.stroke} strokeWidth="2" opacity="0.9" />
            <line x1="16" y1="0" x2="0" y2="16" stroke={metalStyle.stroke} strokeWidth="2" opacity="0.9" />
          </pattern>
        )
      })}

      {/* Small grid pattern */}
      <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" strokeWidth="0.5" />
      </pattern>

      {/* Add clipping path for text overflow */}
      <clipPath id="textClip">
        <rect x="0" y="0" width="100%" height="100%" />
      </clipPath>
    </defs>
  )
}

const PADDING = 40; // px, for fit

const ViaStackVisualization = ({
  viaStack,
  scale = 200,
  layerStyles,
  showCoordinates = true,
  showWHLabels = true,
}: {
  viaStack: ViaStack
  scale: number
  layerStyles: Record<string, { fill: string; stroke: string; pattern: string }>
  showCoordinates?: boolean
  showWHLabels?: boolean
}) => {
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)

  // Calculate bounds
  const allRects = viaStack.layers.flatMap((layer) => layer.rects)
  const minX = Math.min(...allRects.map((rect: number[]) => rect[0]))
  const maxX = Math.max(...allRects.map((rect: number[]) => rect[2]))
  const minY = Math.min(...allRects.map((rect: number[]) => rect[1]))
  const maxY = Math.max(...allRects.map((rect: number[]) => rect[3]))

  // Responsive SVG: get size from parent
  const svgContainerRef = useRef<HTMLDivElement>(null)
  const [svgSize, setSvgSize] = useState({ width: 400, height: 400 })
  useEffect(() => {
    function handleResize() {
      if (svgContainerRef.current) {
        const rect = svgContainerRef.current.getBoundingClientRect()
        const size = Math.min(rect.width, rect.height)
        setSvgSize({ width: size, height: size })
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const width = svgSize.width
  const height = svgSize.height
  const centerX = width / 2
  const centerY = height / 2

  // Fit scale so all rects fit in SVG with padding
  const safeWidth = Math.max(1e-6, maxX - minX)
  const safeHeight = Math.max(1e-6, maxY - minY)
  const fitScaleX = (width - PADDING * 2) / safeWidth
  const fitScaleY = (height - PADDING * 2) / safeHeight
  const fitScale = Math.min(fitScaleX, fitScaleY)
  const userScale = scale / 200 // 200 is the default scale
  const drawScale = fitScale * userScale

  // Logical center of data
  const dataCenterX = (minX + maxX) / 2
  const dataCenterY = (minY + maxY) / 2

  // SVG coordinates for logical (0,0)
  const svgZeroX = centerX + (0 - dataCenterX) * drawScale
  const svgZeroY = centerY - (0 - dataCenterY) * drawScale

  // Compute GCD of all coordinate differences for grid step
  function gcd(a: number, b: number): number {
    if (!b) return Math.abs(a)
    return gcd(b, a % b)
  }
  function gcdArray(arr: number[]): number {
    return arr.reduce((acc, val) => gcd(acc, val))
  }
  // Collect all coordinate differences (x2-x1, y2-y1, x1, y1, x2, y2)
  const allCoords = allRects.flat()
  const allDiffs = [
    ...allRects.map(r => Math.abs(r[2] - r[0])),
    ...allRects.map(r => Math.abs(r[3] - r[1])),
    ...allCoords.map(Math.abs)
  ].filter(v => v > 1e-8)
  let gridStep = 0.1
  if (allDiffs.length > 0) {
    // Use a fixed precision to avoid floating point issues
    const scale = 1e6
    const gcdVal = gcdArray(allDiffs.map(v => Math.round(v * scale))) / scale
    if (gcdVal > 1e-8) gridStep = gcdVal
  }

  const gridLines = []
  for (let gx = Math.ceil(minX / gridStep) * gridStep; gx <= maxX; gx += gridStep) {
    const sx = centerX + (gx - dataCenterX) * drawScale
    gridLines.push(
      <line
        key={`grid-x-${gx}`}
        x1={sx}
        y1={0}
        x2={sx}
        y2={height}
        stroke="#e0e0e0"
        strokeWidth={0.5}
      />
    )
  }
  for (let gy = Math.ceil(minY / gridStep) * gridStep; gy <= maxY; gy += gridStep) {
    const sy = centerY - (gy - dataCenterY) * drawScale
    gridLines.push(
      <line
        key={`grid-y-${gy}`}
        x1={0}
        y1={sy}
        x2={width}
        y2={sy}
        stroke="#e0e0e0"
        strokeWidth={0.5}
      />
    )
  }

  const renderLayer = (layer: Layer, index: number) => {
    const style = layerStyles[layer.layer] || { fill: "#999", stroke: "#666", pattern: "solid" }
    const isVia = layer.layer.toLowerCase().includes("via")
    const LABEL_OFFSET_X = 6; // px
    const LABEL_OFFSET_Y = 14; // px
    const LABEL_OFFSET_BOTTOM = 6; // px
    // Offset for center label to avoid overlap between layers
    const centerYOffset = index * 18; // 18px per layer, adjust as needed

    return (
      <g key={`${layer.layer}-${index}`}>
        {layer.rects.map((rect: number[], rectIndex: number) => {
          const [x1, y1, x2, y2] = rect
          const x = centerX + (x1 - (minX + maxX) / 2) * drawScale
          const y = centerY - (y2 - (minY + maxY) / 2) * drawScale // Flip Y coordinate
          const w = (x2 - x1) * drawScale
          const h = (y2 - y1) * drawScale

          const isSelected = selectedLayer === `${layer.layer}-${index}`

          // Top-left label (inside)
          const labelX1 = x + LABEL_OFFSET_X;
          const labelY1 = y + LABEL_OFFSET_Y;
          // Bottom-right label (inside)
          const labelX2 = x + w - LABEL_OFFSET_X;
          const labelY2 = y + h - LABEL_OFFSET_BOTTOM;

          return (
            <g key={rectIndex}>
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill={
                  isVia ? `url(#viaGrid-${layer.layer.toLowerCase()})` : `url(#pattern-${layer.layer.toLowerCase()})`
                }
                stroke={style.stroke}
                strokeWidth={isVia ? (isSelected ? 4 : 2) : isSelected ? 3 : 1}
                opacity={isSelected ? 1 : 0.8}
                className="cursor-pointer transition-all duration-200 hover:opacity-100"
                onClick={() => setSelectedLayer(isSelected ? null : `${layer.layer}-${index}`)}
              />

              {/* Add coordinate labels always inside the rectangle, if enabled */}
              {showCoordinates && (
                <>
              <text
                    x={labelX1}
                    y={labelY1}
                className="lef-svg-text"
                    textAnchor="start"
                fill={style.stroke}
                    opacity={isSelected ? 1 : 0.7}
                    fontWeight={isSelected ? 'bold' : 'normal'}
              >
                ({x1.toFixed(2)}, {y2.toFixed(2)})
              </text>
              <text
                    x={labelX2}
                    y={labelY2}
                className="lef-svg-text"
                    textAnchor="end"
                fill={style.stroke}
                    opacity={isSelected ? 1 : 0.7}
                    fontWeight={isSelected ? 'bold' : 'normal'}
              >
                ({x2.toFixed(2)}, {y1.toFixed(2)})
              </text>
                </>
              )}

              {/* Center coordinate for reference, offset by index to avoid overlap */}
              <text
                x={x + w / 2}
                y={y + h / 2 + centerYOffset + (isSelected ? 15 : 0)}
                textAnchor="middle"
                dominantBaseline="middle"
                className="lef-svg-text"
                fill={style.stroke}
                style={{ textShadow: "1px 1px 2px rgba(255,255,255,0.8)" }}
              >
                {layer.layer}
                {showWHLabels && (
                <tspan x={x + w / 2} dy="12" className="lef-svg-text" fill={style.stroke}>
                  W: {(x2 - x1).toFixed(2)} H: {(y2 - y1).toFixed(2)}
                </tspan>
                )}
              </text>
            </g>
          )
        })}
      </g>
    )
  }

  return (
    <div>
      <div>
        <div className="lef-layer-badges">
          {viaStack.layers.map((layer, index) => (
            <Badge
              key={`${layer.layer}-${index}`}
              bg={selectedLayer === `${layer.layer}-${index}` ? "primary" : "secondary"}
              className="lef-layer-badge"
              onClick={() =>
                setSelectedLayer(selectedLayer === `${layer.layer}-${index}` ? null : `${layer.layer}-${index}`)
              }
              style={{
                backgroundColor:
                  selectedLayer === `${layer.layer}-${index}` ? layerStyles[layer.layer]?.fill : undefined,
              }}
            >
              {layer.layer}
            </Badge>
          ))}
        </div>
        <div ref={svgContainerRef} className="lef-svg-container">
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="lef-svg" preserveAspectRatio="xMidYMid meet">
            <PatternDefs layerStyles={layerStyles} selectedLayer={selectedLayer ?? undefined} />

            {/* Custom grid lines centered at logical 0,0 */}
            {gridLines}

            {/* Center axes at logical 0,0 */}
            <line x1={svgZeroX} y1="0" x2={svgZeroX} y2={height} stroke="#ccc" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="0" y1={svgZeroY} x2={width} y2={svgZeroY} stroke="#ccc" strokeWidth="1" strokeDasharray="2,2" />

            {/* Render layers from bottom to top with clipping */}
            <g clipPath="url(#textClip)">
              {viaStack.layers.map((layer, index) => renderLayer(layer, index))}
            </g>

            {/* Logical 0,0 label */}
            <text x={svgZeroX} y={svgZeroY} className="lef-svg-text" fill="#6c757d">
              0,0
            </text>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default function LEFVisualizer() {
  const [lefData, setLefData] = useState<ViaStack[]>(defaultLefData)
  const [selectedViaStack, setSelectedViaStack] = useState(0)
  const [scale, setScale] = useState(200)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showCoordinates, setShowCoordinates] = useState(true)
  const [showWHLabels, setShowWHLabels] = useState(true)

  // Ref for the via analysis section
  const analysisRef = useRef<HTMLDivElement | null>(null)

  // Message listener for receiving data
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data
      
      // Check if the message contains LEF data
      if (msg && msg.type === 'lef-data' && msg.data) {
        try {
          const receivedData = msg.data as ViaStack[]
          setLefData(receivedData)
          console.log('Received LEF data:', receivedData)
        } catch (error) {
          console.error('Error parsing LEF data:', error)
        }
      }
    }

    // Add event listener
    window.addEventListener('message', handleMessage)
    // Send ready message to extension
    const sendReadyMessage = () => {
      console.log('Attempting to send ready message...')
      if (window.vscode) {
        window.vscode.postMessage({ command: 'webview-ready' })
        console.log('Sent webview-ready message to extension')
      } else {
        // Fallback for non-VSCode environment
        console.log('VSCode API not available, webview ready')
        // Try alternative method for webview communication
        if (window.parent) {
          window.parent.postMessage({ command: 'webview-ready' }, '*')
          console.log('Sent ready message via window.parent')
        }
      }
    }

    // Send ready message after component mounts
    setTimeout(sendReadyMessage, 100)

    
    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  // Generate dynamic layer styles based on the data
  const layerStyles = useMemo(() => generateLayerStyles(lefData), [lefData])

  // Handler for selecting a via stack from the grid view
  const handleGridCardSelect = (stackIndex: number) => {
    setSelectedViaStack(stackIndex)
    setTimeout(() => {
      analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 0)
  }

  // Show loading state if no data
  if (lefData.length === 0) {
    return (
      <div className="lef-container">
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="text-center">
            <h3>LEF Visualizer</h3>
            <h4 style={{color:"red"}}>Start Editing your LEF file</h4>
            <p>Waiting for data...</p>
            <p className="text-muted small">
              Send data via window.postMessage with format:<br />
              {`{ type: 'lef-data', data: [...] }`}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lef-container">
      {/* Floating Action Button (remains for sidebar/legend) */}
      <Button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`lef-floating-button ${sidebarOpen ? "open" : "closed"}`}
        variant="primary"
      >
        {sidebarOpen ? "✕" : "☰"}
      </Button>
      <a
        href="https://github.com/pkalyankumar1010/lef-drawer/issues"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 1000,
          background: "#007bff",
          color: "white",
          borderRadius: "50%",
          width: 35,
          height: 35,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          textDecoration: "none",
          fontSize: 28,
          transition: "background 0.2s",
          padding: 0,
        }}
        title="Get Support / Report Issue on GitHub"
      >
        {/* Provided customer support SVG icon */}
        <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" width="32" height="32" style={{display:'block'}} viewBox="0 0 6.827 6.827">
          <g>
            <path d="M3.027 4.218c-.854.374-1.11.574-1.212.664-.156.138-.242.653-.334 1.09h3.865c-.092-.437-.179-.952-.335-1.09-.1-.09-.348-.285-1.202-.659l-.782-.005z" fill="#000"/>
            <path d="M3.828 3.471v.947c-.116.146-.268.235-.415.242-.156.007-.308-.077-.414-.242v-.947c0-.51.83-.51.83 0z" fill="#fff"/>
            <path d="M3.828 3.471v.634c-.157.115-.308.179-.415.179-.106 0-.257-.064-.414-.179v-.634c0-.51.83-.51.83 0z" fill="#fff"/>
            <path d="m2.998 4.23-.335.145.427.592.323-.307z" fill="#fff"/>
            <path d="m3.828 4.231.335.144-.426.592-.324-.307z" fill="#fff"/>
            <path d="M5.11 5.032c.098.222.165.604.236.94H4.56c.018-.549.019-.84.548-.94z" fill="#fff"/>
            <path d="M3.413 1.253a1.199 1.199 0 0 1 1.203 1.202c0 .35-.154.829-.397 1.19-.21.311-.491.54-.806.54-.314 0-.595-.229-.805-.54-.243-.361-.397-.84-.397-1.19a1.199 1.199 0 0 1 1.202-1.202z" fill="#fff"/>
            <path d="M2.508 2.392c.218-.02.29-.012.546-.298.304.228.798.298 1.192.187.04-.011.13.158.164.466.27-.039.197-.454.184-.54a1.315 1.315 0 0 0-.33-.602 1.2 1.2 0 0 0-1.7 0c-.201.2-.331.47-.35.771l-.01.47c.066-.091.084-.4.239.045.055-.11-.01-.471.065-.5z" fill="#000"/>
            <path d="M2.216 2.516c.065 0 .218.166.218.367 0 .201-.054.365-.12.365-.065 0-.118-.164-.118-.365 0-.201-.046-.367.02-.367z" fill="#fff"/>
            <path d="M4.611 2.516c-.066 0-.218.166-.218.367 0 .201.053.365.119.365s.119-.164.119-.365c0-.201.046-.367-.02-.367z" fill="#fff"/>
            <path d="M3.188 3.692a.062.062 0 0 0 0-.123h-.71a.338.338 0 0 1-.34-.34.062.062 0 1 0-.123 0 .461.461 0 0 0 .463.463h.71z" fill="#000"/>
            <path d="M1.994 2.535a.062.062 0 0 0 .123 0v-.262c0-.357.146-.68.381-.916a1.292 1.292 0 0 1 1.83 0c.235.235.381.56.381.916v.262a.062.062 0 0 0 .124 0v-.262c0-.39-.16-.746-.417-1.003a1.415 1.415 0 0 0-2.005 0 1.415 1.415 0 0 0-.417 1.003v.262z" fill="#000"/>
            <path d="m2.22 3.333-.087-.04-.002-.823c0-.004.001-.009.003-.013l.08-.017a.03.03 0 0 1 .014.025l-.003.853c0 .006-.001.01-.004.015z" fill="#fff"/>
            <path d="m1.923 2.505.228-.053a.04.04 0 0 0-.003.016v.835l-.241-.11.025-.057-.026.057a.062.062 0 0 1-.035-.058v-.57c0-.03.022-.056.052-.06zm.276-.064.055-.013a.125.125 0 0 1 .028-.003c.036 0 .069.016.094.04a.172.172 0 0 1 .05.12v.61c0 .023-.006.049-.017.072a.176.176 0 0 1-.043.059.12.12 0 0 1-.079.03.108.108 0 0 1-.045-.01l-.036-.016a.04.04 0 0 0 .004-.016v-.846c0-.011-.004-.02-.01-.027z" fill="#000"/>
            <path d="m4.606 3.333.088-.04.002-.823a.027.027 0 0 0-.003-.013l-.08-.017a.03.03 0 0 0-.014.025l.002.853c0 .006.002.01.005.015z" fill="#fff"/>
            <path d="m4.904 2.505-.229-.053a.04.04 0 0 1 .003.016v.835l.242-.11-.026-.057.026.057a.062.062 0 0 0 .036-.058v-.57a.062.062 0 0 0-.052-.06zm-.277-.064-.054-.013a.125.125 0 0 0-.028-.003.133.133 0 0 0-.094.04.172.172 0 0 0-.05.12v.61a.176.176 0 0 0 .06.131.12.12 0 0 0 .078.03c.015 0 .03-.002.045-.01l.036-.016a.04.04 0 0 1-.003-.016v-.846c0-.011.004-.02.01-.027z" fill="#000"/>
            <path d="M3.342 3.447a.185.185 0 0 1 .131.316.185.185 0 0 1-.135.054v-.37h.004z" fill="#000"/>
            <path d="M3.342 3.447a.185.185 0 0 1 .131.316.185.185 0 0 1-.13.054c-.052 0-.252-.02-.286-.054a.185.185 0 0 1 0-.262c.034-.034.234-.054.285-.054z" fill="#000"/>
            <path d="m3.194 5.793.22-.953.219.953-.22.18z" fill="#fff"/>
            <path d="M1.717 5.032c-.098.222-.165.604-.236.94h.784c-.017-.549-.018-.84-.548-.94z" fill="#fff"/>
          </g>
        </svg>
      </a>
      {/* Left 30%: Header + Analysis Section */}
      <div className="lef-left-panel">
        {/* Header */}
        <div className="lef-header">
          <h1>LEF Via Stack Visualizer</h1>
          <p>Interactive visualization of semiconductor via stacks and metal layers</p>
        </div>
        {/* Scale slider below header */}
        <div className="lef-controls">
          <label>Scale:</label>
          <input
            type="range"
            min="100"
            max="400"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="lef-scale-slider"
          />
          <span className="lef-scale-value">{scale}x</span>
          {/* Toggle for coordinates */}
          <label className="lef-checkbox-group">
            <input
              type="checkbox"
              checked={showCoordinates}
              onChange={() => setShowCoordinates((v) => !v)}
              className="lef-checkbox"
            />
            <span className="lef-checkbox-label">Show coordinates</span>
          </label>
          {/* Toggle for width/height labels */}
          <label className="lef-checkbox-group">
            <input
              type="checkbox"
              checked={showWHLabels}
              onChange={() => setShowWHLabels((v) => !v)}
              className="lef-checkbox"
            />
            <span className="lef-checkbox-label">Show W/H</span>
          </label>
        </div>
        {/* Main via analysis section with ref */}
        <div ref={analysisRef} className="lef-analysis-section">
          <Card className="lef-card">
            <div className="px-3 py-2">
              <Card.Header className="lef-card-header">
                <Card.Title className="lef-card-title">
                  <span>{lefData[selectedViaStack].name}</span>
                  <Badge bg="outline-secondary" className="lef-badge">
                    {lefData[selectedViaStack].layers.length} layers
                  </Badge>
                </Card.Title>
              </Card.Header>
              <Card.Body className="lef-card-content">
                <ViaStackVisualization
                  viaStack={lefData[selectedViaStack] as ViaStack}
                  scale={scale}
                  layerStyles={layerStyles}
                  showCoordinates={showCoordinates}
                  showWHLabels={showWHLabels}
                />
              </Card.Body>
            </div>
          </Card>
        </div>
      </div>

      {/* Middle 60%: All Via Stacks Grid View (3 columns) */}
      <div className="lef-middle-panel">
        <h3 className="lef-grid-title">All Via Stacks</h3>
        <div className="lef-grid-container">
          {lefData.map((stack, stackIndex) => {
            // Fit logic for each stack
            const allRects = stack.layers.flatMap((layer) => layer.rects)
            const minX = Math.min(...allRects.map((rect: number[]) => rect[0]))
            const maxX = Math.max(...allRects.map((rect: number[]) => rect[2]))
            const minY = Math.min(...allRects.map((rect: number[]) => rect[1]))
            const maxY = Math.max(...allRects.map((rect: number[]) => rect[3]))
            const miniWidth = 90
            const miniHeight = 90
            const miniCenterX = miniWidth / 2
            const miniCenterY = miniHeight / 2
            const safeWidth = Math.max(1e-6, maxX - minX)
            const safeHeight = Math.max(1e-6, maxY - minY)
            const fitScaleX = (miniWidth - PADDING) / safeWidth
            const fitScaleY = (miniHeight - PADDING) / safeHeight
            const fitScale = Math.min(fitScaleX, fitScaleY)
            const isSelected = selectedViaStack === stackIndex
            return (
              <button
                key={stackIndex}
                type="button"
                onClick={() => handleGridCardSelect(stackIndex)}
                className={`lef-grid-item ${isSelected ? 'selected' : ''}`}
                aria-pressed={isSelected}
              >
                <h4 className="lef-grid-item h4">{stack.name}</h4>
                <div className="d-flex justify-content-center">
                  <svg
                    width={miniWidth}
                    height={miniHeight}
                    className="lef-mini-svg"
                  >
                    <PatternDefs layerStyles={layerStyles} />
                    {/* Mini grid */}
                    <rect width="100%" height="100%" fill="url(#smallGrid)" opacity="0.3" />
                    {/* Mini center axes */}
                    <line
                      x1={miniCenterX}
                      y1="0"
                      x2={miniCenterX}
                      y2={miniHeight}
                      stroke="#ddd"
                      strokeWidth="0.5"
                      strokeDasharray="1,1"
                    />
                    <line
                      x1="0"
                      y1={miniCenterY}
                      x2={miniWidth}
                      y2={miniCenterY}
                      stroke="#ddd"
                      strokeWidth="0.5"
                      strokeDasharray="1,1"
                    />
                    {/* Render mini layers */}
                    {stack.layers.map((layer, layerIndex) => {
                      const style = layerStyles[layer.layer] || { fill: "#999", stroke: "#666", pattern: "solid" }
                      const isVia = layer.layer.toLowerCase().includes("via")
                      return (
                        <g key={`mini-${layer.layer}-${layerIndex}`}>
                          {layer.rects.map((rect, rectIndex) => {
                            const [x1, y1, x2, y2] = rect
                            const x = miniCenterX + (x1 - (minX + maxX) / 2) * fitScale
                            const y = miniCenterY - (y2 - (minY + maxY) / 2) * fitScale
                            const w = (x2 - x1) * fitScale
                            const h = (y2 - y1) * fitScale
                            return (
                              <g key={rectIndex}>
                                <rect
                                  x={x}
                                  y={y}
                                  width={w}
                                  height={h}
                                  fill={
                                    isVia
                                      ? `url(#viaGrid-${layer.layer.toLowerCase()})`
                                      : `url(#pattern-${layer.layer.toLowerCase()})`
                                  }
                                  stroke={style.stroke}
                                  strokeWidth={isVia ? 2 : 1}
                                  opacity="0.8"
                                />
                                {/* Add edge coordinates for mini view if enabled */}
                                {showCoordinates && (
                                  <>
                                <text
                                      x={x + 2}
                                      y={y + 8}
                                      className="lef-svg-text-small"
                                      textAnchor="start"
                                      fontSize="5"
                                  fill={style.stroke}
                                >
                                  ({x1.toFixed(1)},{y2.toFixed(1)})
                                </text>
                                <text
                                      x={x + w - 2}
                                      y={y + h - 2}
                                      className="lef-svg-text-small"
                                      textAnchor="end"
                                      fontSize="5"
                                  fill={style.stroke}
                                >
                                  ({x2.toFixed(1)},{y1.toFixed(1)})
                                </text>
                                  </>
                                )}
                                {/* Layer name in center */}
                                <text
                                  x={x + w / 2}
                                  y={y + h / 2}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  className="lef-svg-text-center"
                                  fontSize="6"
                                  fill={style.stroke}
                                  style={{ textShadow: "1px 1px 2px rgba(255,255,255,0.8)" }}
                                >
                                  {layer.layer}
                                  {showWHLabels && (
                                    <tspan x={x + w / 2} dy="8" className="lef-svg-text-center" fill={style.stroke}>
                                      W: {(x2 - x1).toFixed(2)} H: {(y2 - y1).toFixed(2)}
                                    </tspan>
                                  )}
                                </text>
                              </g>
                            )
                          })}
                        </g>
                      )
                    })}
                    {/* Mini coordinate label */}
                    <text x={miniCenterX} y={miniCenterY} className="lef-svg-text-center" fill="#6c757d" fontSize="6">
                      0,0
                    </text>
                  </svg>
                </div>
                {/* Layer count badge */}
                <div className="lef-mini-badge">
                  <Badge bg="outline-secondary" className="lef-badge">
                    {stack.layers.length} layers
                  </Badge>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Right 15%: Via stack selection buttons */}
      <div className="lef-right-panel">
              {lefData.map((viaStack, index) => (
                <Button
                  key={index}
                  variant={selectedViaStack === index ? "primary" : "outline-secondary"}
                  onClick={() => setSelectedViaStack(index)}
                  className="lef-sidebar-button"
                >
                  <span className="text-break text-center w-100 d-block">{viaStack.name}</span>
                </Button>
              ))}
            </div>

      {/* Legend sidebar, more compact */}
      <div className={`lef-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="lef-sidebar-content">
          <div className="mb-2">
            <h3 className="lef-legend-title">Layer Legend</h3>
          </div>
          <div>
            {Object.entries(layerStyles).map(([layerName, style]) => {
              // For vias, use the color of the metal layer below (if available)
              let legendFill = style.fill;
              if (layerName.toLowerCase().includes('via')) {
                // Try to find the metal layer below by number (e.g., Via2 -> Metal1)
                const viaNum = layerName.match(/via(\d+)/i);
                if (viaNum && viaNum[1]) {
                  const metalBelow = `Metal${parseInt(viaNum[1], 10)}`;
                  if (layerStyles[metalBelow]) {
                    legendFill = layerStyles[metalBelow].fill;
                  }
                }
              }
              return (
                <div key={layerName} className="lef-legend-item">
                  <div
                    className="lef-legend-color"
                    style={{ backgroundColor: legendFill }}
                />
                <div className="lef-legend-text">
                    <span className="lef-legend-layer">{layerName}</span>
                    <span className="lef-legend-pattern">{style.pattern} pattern</span>
                </div>
              </div>
              )
            })}
          </div>
          <div className="lef-pattern-guide">
            <h4 className="lef-pattern-title">Pattern Guide</h4>
            <div>
              <div className="lef-pattern-item">• Forward slash: Even metal layers</div>
              <div className="lef-pattern-item">• Backslash: Odd metal layers</div>
              <div className="lef-pattern-item">• Big cross: All vias</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
