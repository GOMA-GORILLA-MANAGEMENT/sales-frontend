import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "../../lib/utils"

const ChartContext = React.createContext({
  config: {},
  style: {},
})

function ChartContainer({
  className,
  children,
  config = {},
  style = {},
  id,
  ...props
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`

  const defaultConfig = {
    colors: {
      primary: '#8b5cf6',
      secondary: '#94a3b8',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
    ...config,
  }

  return (
    <ChartContext.Provider value={{ config: defaultConfig, style }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "w-full h-full min-h-[400px]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  )
}

const ChartStyle = ({ id, config }) => {
  const { colors } = config
  
  return (
    <style>
      {`
        #${id} .recharts-cartesian-grid-horizontal line,
        #${id} .recharts-cartesian-grid-vertical line {
          stroke: #f1f5f9;
          stroke-dasharray: 3 3;
        }
        #${id} .recharts-cartesian-axis-line {
          stroke: #e2e8f0;
        }
        #${id} .recharts-cartesian-axis-tick-value {
          fill: #64748b;
          font-size: 0.75rem;
          line-height: 1rem;
        }
        #${id} .recharts-tooltip-cursor {
          fill: rgba(0, 0, 0, 0.05);
        }
        #${id} .recharts-tooltip {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          padding: 0.75rem;
        }
      `}
    </style>
  )
}

const ChartTooltip = ({
  active,
  payload,
  label,
  formatter = (value) => value,
  labelFormatter = (label) => label,
  className,
  ...props
}) => {
  if (!active || !payload?.length) return null

  return (
    <div className={cn("bg-white p-4 rounded-lg shadow-lg border border-gray-200", className)} {...props}>
      <h4 className="font-medium text-gray-900">{labelFormatter(label)}</h4>
      <div className="mt-2 space-y-1">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
            <span className="text-sm font-medium text-gray-900 ml-4">
              {formatter(item.value, item.name, item)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export {
  ChartContainer,
  ChartTooltip,
  ChartStyle,
  ChartContext,
  RechartsPrimitive as Recharts,
}