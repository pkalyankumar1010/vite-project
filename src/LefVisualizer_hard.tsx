import { useState, useMemo, useRef, useEffect } from "react"
import { Card, Badge, Button } from "react-bootstrap"
import "./LefVisualizer.css"

const lefData = [
  {
    name: "M2_M1",
    layers: [
      {
        layer: "Metal1",
        rects: [[-5.2, -0.4, 0.4, 0.4], [-0.4, -0.8, 0.4, 0.8]],
      },
      {
        layer: "Via1",
        rects: [[-0.4, -0.4, 0.4, 0.4]],
      },
      {
        layer: "Metal2",
        rects: [[-0.8, -0.8, 0.8, 0.2]],
      },
    ],
  },
  {
    name: "M3_M2",
    layers: [
      {
        layer: "Metal2",
        rects: [[-0.2, -0.2, 0.2, 0.2]],
      },
      {
        layer: "Via2",
        rects: [[-0.1, -0.1, 0.1, 0.1]],
      },
      {
        layer: "Metal3",
        rects: [[-0.2, -0.2, 0.2, 0.2]],
      },
    ],
  },
  {
    name: "M4_M3",
    layers: [
      {
        layer: "Metal3",
        rects: [[-0.2, -0.2, 0.2, 0.2]],
      },
      {
        layer: "Via3",
        rects: [[-0.1, -0.1, 0.1, 0.1]],
      },
      {
        layer: "Metal4",
        rects: [[-0.2, -0.2, 0.2, 0.2]],
      },
    ],
  },
  {
    name: "M5_M4",
    layers: [
      {
        layer: "Metal4",
        rects: [[-0.2, -0.2, 0.2, 0.2]],
      },
      {
        layer: "Via4",
        rects: [[-0.1, -0.1, 0.1, 0.1]],
      },
      {
        layer: "Metal5",
        rects: [[-0.2, -0.2, 0.2, 0.2]],
      },
    ],
  },
  {
    name: "M6_M5",
    layers: [
      {
        layer: "Metal5",
        rects: [[-0.2, -0.2, 0.2, 0.2]],
      },
      {
        layer: "Via5",
        rects: [[-0.1, -0.1, 0.1, 0.1]],
      },
      {
        layer: "Metal6",
        rects: [[-0.2, -0.2, 0.2, 0.2]],
      },
    ],
  },
  {
    name: "Via23_stack_north",
    layers: [
      {
        layer: "Metal2",
        rects: [[-0.2, -0.2, 0.2, 0.3]],
      },
      {
        layer: "Via2",
        rects: [[-0.1, -0.1, 0.1, 0.1]],
      },
      {
        layer: "Metal3",
        rects: [[-0.2, -0.2, 0.2, 0.2]],
      },
    ],
  },
  {
    name: "Via23_stack_south",
    layers: [
      {
        layer: "Metal2",
        rects: [[-0.2, -0.3, 0.2, 0.2]],
      },
      {
        layer: "Via2",
        rects: [[-0.1, -0.1, 0.1, 0.1]],
      },
      {
        layer: "Metal3",
        rects: [[-0.2, -0.2, 0.2, 0.2]],
      },
    ],
  },
  {
    name: "Via34_stack_east",
    layers: [
      {
        layer: "Metal3",
        rects: [[-0.2, -0.2, 0.3, 0.2]],
      },
      {
        layer: "Via3",
        rects: [[-0.1, -0.1, 0.1, 0.1]],
      },
      {
        layer: "Metal4",
        rects: [[-0.2, -0.2, 0.2, 0.2]],
      },
    ],
  },
  {
    name: "Via34_stack_west",
    layers: [
      {
        layer: "Metal3",
        rects: [[-0.3, -0.2, 0.2, 0.2]],
      },
      {
        layer: "Via3",
        rects: [[-0.1, -0.1, 0.1, 0.1]],
      },
      {
        layer: "Metal4",
        rects: [[-0.2, -0.2, 0.2, 0.2]],
      },
    ],
  },
  {
    name: "Via45_stack_north",
    layers: [
      {
        layer: "Metal4",
        rects: [[-0.2, -0.2, 0.2, 0.3]],
      },
      {
        layer: "Via4",
        rects: [[-0.1, -0.1, 0.1, 0.1]],
      },
      {
        layer: "Metal5",
        rects: [[-0.2, -0.2, 0.2, 0.2]],
      },
    ],
  },
  {
    name: "Via45_stack_south",
    layers: [
      {
        layer: "Metal4",
        rects: [[-0.2, -0.3, 0.2, 0.2]],
      },
      {
        layer: "Via4",
        rects: [[-0.1, -0.1, 0.1, 0.1]],
      },
      {
        layer: "Metal5",
        rects: [[-0.2, -0.2, 0.2, 0.2]],
      },
    ],
  },
  {
    name: "Via56_stack_east",
    layers: [
      {
        layer: "Metal5",
        rects: [[-0.2, -0.2, 0.3, 0.2]],
      },
      {
        layer: "Via5",
        rects: [[-0.1, -0.1, 0.1, 0.1]],
      },
      {
        layer: "Metal6",
        rects: [[-0.2, -0.2, 0.2, 0.2]],
      },
    ],
  },
  {
    name: "Via56_stack_west",
    layers: [
      {
        layer: "Metal5",
        rects: [[-0.3, -0.2, 0.2, 0.2]],
      },
      {
        layer: "Via5",
        rects: [[-0.1, -0.1, 0.1, 0.1]],
      },
      {
        layer: "Metal6",
        rects: [[-0.2, -0.2, 0.2, 0.2]],
      },
    ],
  },
]

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
  const metals = layerArray.filter((layer) => layer.toLowerCase().includes("metal"))
  const vias = layerArray.filter((layer) => layer.toLowerCase().includes("via"))

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
  const metals = Object.keys(layerStyles).filter((layer) => layer.toLowerCase().includes("metal"))
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
  const [selectedViaStack, setSelectedViaStack] = useState(0)
  const [scale, setScale] = useState(200)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showCoordinates, setShowCoordinates] = useState(true)
  const [showWHLabels, setShowWHLabels] = useState(true)

  // Ref for the via analysis section
  const analysisRef = useRef<HTMLDivElement | null>(null)

  // Generate dynamic layer styles based on the data
  const layerStyles = useMemo(() => generateLayerStyles(lefData as ViaStack[]), [])

  // Handler for selecting a via stack from the grid view
  const handleGridCardSelect = (stackIndex: number) => {
    setSelectedViaStack(stackIndex)
    setTimeout(() => {
      analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 0)
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
